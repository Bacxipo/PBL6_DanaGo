import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' })
  @MaxLength(72)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  confirmPassword: string;
}
