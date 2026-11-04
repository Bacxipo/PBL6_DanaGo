import { Module } from '@nestjs/common';
import { ReviewController } from './controllers/review.controller';
import { ReviewService } from './services/review.service';
import { ReviewRepository } from './repositories/review.repository';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository, JwtService],
  exports: [ReviewService],
})
export class CommunityModule {}
