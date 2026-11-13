import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

// Admin tạo tài khoản nhân viên (STAFF/ADMIN)
export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @Matches(/^[a-zA-Z0-9_.]+$/, { message: 'Tên đăng nhập chỉ gồm chữ, số, dấu _ và .' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password: string;

  @IsEnum(UserRole, { message: 'Vai trò phải là ADMIN, STAFF hoặc USER' })
  role: UserRole;
}
