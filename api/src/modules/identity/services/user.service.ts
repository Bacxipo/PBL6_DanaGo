import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { UserResponseDto } from '../dto/user-response.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserRoleDto, UpdateUserStatusDto } from '../dto/update-user.dto';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
