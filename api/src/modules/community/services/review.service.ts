import { Injectable } from '@nestjs/common';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewMapper } from '../mappers/review.mapper';
import { ReviewResponseDto } from '../dto/review-response.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async getDestinationReviews(destinationId: number): Promise<ReviewResponseDto[]> {
    const list = await this.reviewRepository.findByDestinationId(destinationId);
    return list.map(item => ReviewMapper.toResponseDto(item));
  }
}
