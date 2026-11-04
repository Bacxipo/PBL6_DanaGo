import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(userId: number) {
    super(`Không tìm thấy người dùng với ID: ${userId}`);
  }
}
