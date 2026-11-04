import { 
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewMapper } from '../mappers/review.mapper';
import { ReviewResponseDto } from '../dto/review-response.dto';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly prisma: PrismaService,
  ) {}

  // 1. Lấy danh sách reviews đã duyệt của 1 điểm đến (cho người dùng xem công khai)
  async getDestinationReviews(destinationId: number): Promise<ReviewResponseDto[]> {
    const list = await this.reviewRepository.findByDestinationId(destinationId);
    return list.map((item) => ReviewMapper.toResponseDto(item));
  }

  // 2. Lấy danh sách reviews của user hiện tại (thấy bài của mình kèm trạng thái PENDING/APPROVED)
  async getMyReviews(userId: number): Promise<any[]> {
    const list = await this.reviewRepository.findByUserId(userId);
    return list.map((item) => ReviewMapper.toResponseDto(item));
  }

  // 3. Tạo review mới (Mặc định trạng thái PENDING chờ Admin duyệt)
  async createReview(userId: number, dto: CreateReviewDto): Promise<ReviewResponseDto> {
    // Kiểm tra điểm đến có tồn tại không
    const destination = await this.prisma.destination.findUnique({
      where: { id: dto.destinationId },
    });
    if (!destination) {
      throw new NotFoundException(`Không tìm thấy điểm đến với id ${dto.destinationId}.`);
    }

    // Kiểm tra xem user đã từng đánh giá địa điểm này chưa (chống spam review)
    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_destinationId: {
          userId,
          destinationId: dto.destinationId,
        },
      },
    });
    if (existingReview) {
      throw new ConflictException('Bạn đã đánh giá địa điểm này rồi. Hãy sử dụng chức năng chỉnh sửa!');
    }

    // Tạo review mới với status = PENDING
    const created = await this.reviewRepository.create(userId, dto);
    return ReviewMapper.toResponseDto(created);
  }

  // 4. Chỉnh sửa review (Sau khi sửa, chuyển lại PENDING để Admin duyệt lại)
  async updateReview(
    reviewId: number,
    userId: number,
    dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Không tìm thấy đánh giá với id ${reviewId}.`);
    }

    // Kiểm tra quyền sở hữu review
    if (review.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài đánh giá này.');
    }

    const updated = await this.reviewRepository.update(reviewId, userId, dto);

    // Tính lại rating của Destination (vì bài này chuyển về PENDING chờ duyệt lại)
    await this.updateDestinationAvgRating(review.destinationId);

    return ReviewMapper.toResponseDto(updated);
  }

  // 5. Xóa review
  async deleteReview(
    reviewId: number,
    userId: number,
    isAdmin: boolean = false,
  ): Promise<{ message: string }> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Không tìm thấy đánh giá với id ${reviewId}.`);
    }

    if (review.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền xóa bài đánh giá này.');
    }

    await this.reviewRepository.delete(reviewId);

    // Cập nhật lại số sao trung bình sau khi xóa
    await this.updateDestinationAvgRating(review.destinationId);

    return { message: 'Xóa đánh giá thành công.' };
  }

  // 6. [ADMIN] Lấy danh sách các bài đánh giá đang chờ duyệt
  async getPendingReviews(): Promise<any[]> {
    return this.reviewRepository.findPendingReviews();
  }

  // 7. [ADMIN] Duyệt hoặc từ chối bài đánh giá
  async moderateReview(reviewId: number, status: ContentStatus): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Không tìm thấy đánh giá với id ${reviewId}.`);
    }

    // Cập nhật trạng thái PENDING -> APPROVED hoặc REJECTED
    const updated = await this.reviewRepository.updateStatus(reviewId, status);

    // Tự động tính toán lại điểm số sao trung bình của địa điểm khi có bài được duyệt/từ chối
    await this.updateDestinationAvgRating(review.destinationId);

    return ReviewMapper.toResponseDto(updated);
  }

  // Helper tính và cập nhật avgRating trong bảng Destination
  private async updateDestinationAvgRating(destinationId: number): Promise<void> {
    const { avgRating } = await this.reviewRepository.calculateAvgRating(destinationId);
    await this.prisma.destination.update({
      where: { id: destinationId },
      data: {
        avgRating: Number(avgRating.toFixed(1)),
      },
    });
  }
}
