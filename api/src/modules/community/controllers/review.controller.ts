import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch,
  Delete, 
  Body, 
  Param, 
  ParseIntPipe, 
  UseGuards, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { ReviewResponseDto } from '../dto/review-response.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { UpdateReviewStatusDto } from '../dto/update-review-status.dto';
import { UserRole } from '@prisma/client';

@Controller('community/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // 1. [PUBLIC] Lấy ds reviews đã được duyệt của 1 điểm đến
  // GET /community/reviews/destination/:destinationId
  @Get('destination/:destinationId')
  async getDestinationReviews(
    @Param('destinationId', ParseIntPipe) destinationId: number,
  ): Promise<ReviewResponseDto[]> {
    return this.reviewService.getDestinationReviews(destinationId);
  }

  // 2. [USER] Lấy ds reviews của chính user đang đăng nhập
  // GET /community/reviews/my
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyReviews(@CurrentUser() user: any): Promise<any[]> {
    const userId = user.sub || user.userId;
    return this.reviewService.getMyReviews(userId);
  }

  // 3. [ADMIN] Lấy danh sách các bài đánh giá đang chờ duyệt
  // GET /community/reviews/admin/pending
  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPendingReviews(): Promise<any[]> {
    return this.reviewService.getPendingReviews();
  }

  // 4. [ADMIN] Duyệt hoặc từ chối bài đánh giá
  // PATCH /community/reviews/:id/status
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async moderateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewStatusDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewService.moderateReview(id, dto.status);
  }

  // 5. [USER] Tạo mới bài đánh giá (Mặc định PENDING chờ duyệt)
  // POST /community/reviews
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @CurrentUser() user: any,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const userId = user.sub || user.userId;
    return this.reviewService.createReview(userId, dto);
  }

  // 6. [USER] Sửa bài đánh giá (Chuyển về PENDING chờ duyệt lại)
  // PUT /community/reviews/:id
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const userId = user.sub || user.userId;
    return this.reviewService.updateReview(id, userId, dto);
  }

  // 7. [USER/ADMIN] Xóa bài đánh giá
  // DELETE /community/reviews/:id
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    const userId = user.sub || user.userId;
    const isAdmin = user.role === 'ADMIN';
    return this.reviewService.deleteReview(id, userId, isAdmin);
  }
}
