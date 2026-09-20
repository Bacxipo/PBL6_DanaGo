import { UserEntity } from '../entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';

export class UserMapper {
  static toResponseDto(entity: UserEntity): UserResponseDto {
    return {
      id: entity.id,
      username: entity.username,
      fullName: entity.fullName,
      email: entity.email,
      avatarUrl: entity.avatarUrl,
      bio: entity.bio,
      role: entity.role,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
