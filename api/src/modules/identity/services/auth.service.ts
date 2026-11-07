import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { ConflictException, ServiceUnavailableException, UnauthorizedException, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserMapper } from '../mappers/user.mapper';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingEmail = await this.userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new UserAlreadyExistsException('Email', dto.email);
    }

    const existingUsername = await this.userRepository.findByUsername(dto.username);
    if (existingUsername) {
      throw new UserAlreadyExistsException('Tên đăng nhập', dto.username);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const newUser = await this.userRepository.create({
      username: dto.username,
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      avatarUrl: dto.avatarUrl,
      bio: dto.bio,
      role: 'USER',
      status: 'ACTIVE',
    });

    const accessToken = this.generateToken(newUser.id, newUser.username, newUser.role);

    return {
      accessToken,
      user: UserMapper.toResponseDto(newUser),
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmailOrUsername(dto.emailOrUsername);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    if (user.status === 'LOCKED') {
      throw new ForbiddenException('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    const accessToken = this.generateToken(user.id, user.username, user.role);

    return {
      accessToken,
      user: UserMapper.toResponseDto(user),
    };
  }

  async loginWithGoogleIdToken(idToken: string): Promise<AuthResponseDto> {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
      || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) throw new ServiceUnavailableException('Chưa cấu hình Supabase Auth.');
    // A separate client for every request prevents sharing mobile users' sessions.
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) }),
      },
    });
    // Supabase verifies Google's signature, issuer, expiration and accepted audience.
    // Never trust an email obtained only by decoding the token.
    const { data, error } = await client.auth.signInWithIdToken({
      provider: 'google', token: idToken,
    });
    if (error || !data.session) {
      throw new UnauthorizedException('Không xác minh được tài khoản Google. Kiểm tra token và Google Client ID.');
    }
    // Reuse web account lookup, account-status checks and DanaGo JWT issuance.
    return this.loginWithGoogle(data.session.access_token);
  }

  async loginWithGoogle(accessToken: string): Promise<AuthResponseDto> {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
      || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) throw new ServiceUnavailableException('Chưa cấu hình Supabase Auth.');
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.auth.getUser(accessToken);
    const identity = data.user;
    if (error || !identity?.email || !identity.email_confirmed_at
      || !identity.identities?.some((item) => item.provider === 'google')) {
      throw new UnauthorizedException('Phiên đăng nhập Google không hợp lệ.');
    }
    const googleIdentity = identity.identities.find((item) => item.provider === 'google');
    const picture = googleIdentity?.identity_data?.avatar_url
      || googleIdentity?.identity_data?.picture
      || identity.user_metadata.avatar_url
      || identity.user_metadata.picture;
    let avatarUrl: string | null = null;
    if (typeof picture === 'string' && picture.length <= 255) {
      try {
        if (new URL(picture).protocol === 'https:') avatarUrl = picture;
      } catch { /* Missing or invalid photos use the default avatar. */ }
    }
    let user = await this.userRepository.findBySupabaseId(identity.id);
    if (!user) {
      if (await this.userRepository.findByEmail(identity.email)) {
        throw new ConflictException('Email đã có tài khoản DanaGo. Vui lòng đăng nhập bằng mật khẩu; liên kết Google chưa được hỗ trợ.');
      }
      try {
        user = await this.userRepository.create({
          supabaseId: identity.id,
          username: `gg_${identity.id.replace(/-/g, '')}`,
          email: identity.email,
          fullName: String(identity.user_metadata.full_name || identity.email.split('@')[0]).slice(0, 100),
          // Google-only users have an unguessable password; password login cannot be used.
          passwordHash: await bcrypt.hash(randomBytes(48).toString('hex'), 10),
          role: 'USER', status: 'ACTIVE',
        });
      } catch (error) {
        if (error?.code !== 'P2002') throw error;
        user = await this.userRepository.findBySupabaseId(identity.id);
        if (!user) throw new ConflictException('Email đã được sử dụng. Vui lòng đăng nhập bằng mật khẩu.');
      }
    }
    if (user.status !== 'ACTIVE') throw new ForbiddenException('Tài khoản chưa hoạt động hoặc đã bị khóa.');
    if ((user.avatarUrl ?? null) !== avatarUrl) {
      user = await this.userRepository.update(user.id, { avatarUrl });
    }
    return { accessToken: this.generateToken(user.id, user.username, user.role), user: UserMapper.toResponseDto(user) };
  }

  private generateToken(userId: number, username: string, role: string): string {
    const payload = { sub: userId, username, role };
    return this.jwtService.sign(payload);
  }
}
