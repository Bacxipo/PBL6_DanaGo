import { NotFoundException } from '@nestjs/common';

export class LodgingNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Không tìm thấy nơi lưu trú với ID ${id}.`);
  }
}
