import { Injectable } from '@nestjs/common';
import { ReviewEntity } from '../entities/review.entity';

@Injectable()
export class ReviewRepository {
  async findByDestinationId(destinationId: number): Promise<ReviewEntity[]> {
    return [
      {
        id: 1,
        userId: 1,
        destinationId,
        rating: 5,
        comment: 'Địa điểm rất đẹp và dịch vụ tuyệt vời!',
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
}
