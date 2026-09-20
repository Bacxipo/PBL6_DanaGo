import { NotFoundException } from '@nestjs/common';

export class DestinationNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Không tìm thấy điểm đến với ID: ${id}`);
  }
}
