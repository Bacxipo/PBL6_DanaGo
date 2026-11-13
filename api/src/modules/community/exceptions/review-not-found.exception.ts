import { NotFoundException } from '@nestjs/common';

export class ReviewNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Không tìm thấy đánh giá với ID: ${id}`);
  }
}
