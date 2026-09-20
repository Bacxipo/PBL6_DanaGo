import { Controller, Get, Param } from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { ReviewResponseDto } from '../dto/review-response.dto';

@Controller('community/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('destination/:destinationId')
  async getDestinationReviews(@Param('destinationId') destinationId: string): Promise<ReviewResponseDto[]> {
    return this.reviewService.getDestinationReviews(+destinationId);
  }
}
