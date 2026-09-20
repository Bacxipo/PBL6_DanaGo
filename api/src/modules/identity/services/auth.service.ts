import { Injectable } from '@nestjs/common';
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

    const accessToken = this.generateToken(user.id, user.username, user.role);

    return {
      accessToken,
      user: UserMapper.toResponseDto(user),
    };
  }

  private generateToken(userId: number, username: string, role: string): string {
    const payload = { sub: userId, username, role };
    return this.jwtService.sign(payload);
  }
}
