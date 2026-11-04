import { UnauthorizedException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super('Email, tên đăng nhập hoặc mật khẩu không chính xác.');
  }
}
