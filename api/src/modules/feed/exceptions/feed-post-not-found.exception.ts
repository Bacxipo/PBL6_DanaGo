import { NotFoundException } from '@nestjs/common';

export class FeedPostNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Không tìm thấy bài viết feed với ID: ${id}`);
  }
}
