import { ReviewEntity } from '../entities/review.entity';
import { ReviewResponseDto } from '../dto/review-response.dto';

export class ReviewMapper {
  static toResponseDto(entity: ReviewEntity): ReviewResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      destinationId: entity.destinationId,
      rating: entity.rating,
      comment: entity.comment,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
