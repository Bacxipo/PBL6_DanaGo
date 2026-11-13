import { IsEnum } from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus, { message: 'Trạng thái phải là ACTIVE, LOCKED hoặc PENDING' })
  status: UserStatus;
}

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'Vai trò phải là ADMIN, STAFF hoặc USER' })
  role: UserRole;
}
