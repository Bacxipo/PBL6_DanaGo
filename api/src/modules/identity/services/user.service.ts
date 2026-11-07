import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { SupabaseStorageService } from '../../../shared/storage/supabase-storage.service';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { UserResponseDto } from '../dto/user-response.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserRoleDto, UpdateUserStatusDto } from '../dto/update-user.dto';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class UserService {
  async updateAvatar(userId: number, file: Express.Multer.File) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundException(userId);
    if (user.status !== 'ACTIVE') throw new ForbiddenException('Tài khoản chưa hoạt động hoặc đã bị khóa.');
    if (!file || !file.buffer?.length || file.size > 5 * 1024 * 1024) throw new BadRequestException('Vui lòng chọn ảnh tối đa 5MB.');
    const buffer = file.buffer;
    const valid = (file.mimetype === 'image/jpeg' && buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255])))
      || (file.mimetype === 'image/png' && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
      || (file.mimetype === 'image/webp' && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP');
    if (!valid) throw new BadRequestException('Nội dung ảnh không hợp lệ. Vui lòng chọn ảnh JPG, PNG hoặc WebP.');
    const bucket = 'avater_image';
    const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.mimetype];
    const avatarUrl = await this.storageService.uploadFile({ ...file, originalname: `avatar.${extension}` }, bucket, String(userId));
    try {
      const updated = await this.userRepository.update(userId, { avatarUrl });
      return UserMapper.toResponseDto(updated);
    } catch (error) {
      await this.storageService.deleteFileByUrl(avatarUrl, bucket);
      throw error;
    }
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundException(userId);
    if (user.status !== 'ACTIVE') throw new ForbiddenException('Tài khoản chưa hoạt động hoặc đã bị khóa.');
    if (user.supabaseId) throw new BadRequestException('Tài khoản Google cần đổi mật khẩu trong tài khoản Google.');
    if (dto.newPassword !== dto.confirmPassword) throw new BadRequestException('Xác nhận mật khẩu mới không khớp.');
    if (Buffer.byteLength(dto.newPassword, 'utf8') > 72) throw new BadRequestException('Mật khẩu mới vượt quá giới hạn 72 byte.');
    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) throw new BadRequestException('Mật khẩu hiện tại không đúng.');
    if (await bcrypt.compare(dto.newPassword, user.passwordHash)) throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại.');
    const hash = await bcrypt.hash(dto.newPassword, 10);
    const updated = await this.userRepository.changePassword(userId, user.passwordHash, hash);
    if (!updated) throw new BadRequestException('Mật khẩu đã thay đổi. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    return { message: 'Đổi mật khẩu thành công.' };
  }

  async getPreferences(userId: number) {
    this.validatePreferenceUser(userId);
    const preferences = await this.userRepository.getPreferences(userId);
    return { categoryIds: preferences.map((item) => item.categoryId) };
  }

  async updatePreferences(userId: number, categoryIds: number[]) {
    this.validatePreferenceUser(userId);
    const categories = await this.userRepository.findPreferenceCategories(categoryIds);
    if (categories.length !== categoryIds.length) throw new BadRequestException('Danh mục sở thích không hợp lệ.');
    return this.userRepository.savePreferences(userId, categoryIds);
  }

  private validatePreferenceUser(userId: number) {
    if (!Number.isSafeInteger(userId) || userId <= 0) throw new BadRequestException('Người dùng không hợp lệ.');
  }
  constructor(private readonly userRepository: UserRepository, private readonly storageService: SupabaseStorageService) { }

  async getUserProfile(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return UserMapper.toResponseDto(user);
  }

  async listUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((u) => UserMapper.toResponseDto(u));
  }

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    if (await this.userRepository.findByEmail(dto.email)) {
      throw new UserAlreadyExistsException('Email', dto.email);
    }
    if (await this.userRepository.findByUsername(dto.username)) {
      throw new UserAlreadyExistsException('Tên đăng nhập', dto.username);
    }

    const created = await this.userRepository.create({
      username: dto.username,
      fullName: dto.fullName,
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, 10),
      role: dto.role,
      status: 'ACTIVE',
    });
    return UserMapper.toResponseDto(created);
  }
  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    await this.getUserProfile(userId);

    if (dto.categoryIds !== undefined) {
      const categories = await this.userRepository.findPreferenceCategories(dto.categoryIds);
      if (categories.length !== dto.categoryIds.length) throw new BadRequestException('Danh mục sở thích không hợp lệ.');
    }
    const user = await this.userRepository.updateProfile(userId, {
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber || null,
      bio: dto.bio || null,
    }, dto.categoryIds);

    return UserMapper.toResponseDto(user);
  }

  updateStatus(id: number, dto: UpdateUserStatusDto, currentUserId: number): Promise<UserResponseDto> {
    return this.updateOther(id, { status: dto.status }, currentUserId);
  }

  updateRole(id: number, dto: UpdateUserRoleDto, currentUserId: number): Promise<UserResponseDto> {
    return this.updateOther(id, { role: dto.role }, currentUserId);
  }

  // Admin không được tự khóa / tự hạ quyền để tránh mất quyền quản trị
  private async updateOther(id: number, data: UpdateUserStatusDto | UpdateUserRoleDto, currentUserId: number) {
    if (id === currentUserId) {
      throw new BadRequestException('Không thể tự khóa hoặc tự đổi vai trò của chính mình.');
    }
    await this.getUserProfile(id);
    return UserMapper.toResponseDto(await this.userRepository.update(id, data));
  }

}
