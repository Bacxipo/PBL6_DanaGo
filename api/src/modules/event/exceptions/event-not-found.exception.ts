import { NotFoundException } from '@nestjs/common';

export class EventNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Không tìm thấy sự kiện với ID: ${id}`);
  }
}
