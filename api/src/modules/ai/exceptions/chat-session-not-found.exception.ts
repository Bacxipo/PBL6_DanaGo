import { NotFoundException } from '@nestjs/common';

export class ChatSessionNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Không tìm thấy phiên trò chuyện với ID: ${id}`);
  }
}
