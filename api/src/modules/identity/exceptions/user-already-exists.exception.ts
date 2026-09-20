import { ConflictException } from '@nestjs/common';

export class UserAlreadyExistsException extends ConflictException {
  constructor(field: string, value: string) {
    super(`Người dùng với ${field} '${value}' đã tồn tại trong hệ thống.`);
  }
}
