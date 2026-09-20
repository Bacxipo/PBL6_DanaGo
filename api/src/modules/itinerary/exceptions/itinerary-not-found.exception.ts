import { NotFoundException } from '@nestjs/common';

export class ItineraryNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Không tìm thấy chuyến đi với ID: ${id}`);
  }
}
