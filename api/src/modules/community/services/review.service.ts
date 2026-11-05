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
import { SupabaseStorageService } from '../../../shared/storage/supabase-storage.service';
import 'multer';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
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
  async createReview(
    userId: number, 
    dto: CreateReviewDto,
    files?: Express.Multer.File[], // Nhận các file ảnh từ Controller
): Promise<ReviewResponseDto> {
    // 1. Kiểm tra địa điểm tồn tại
    const destination = await this.prisma.destination.findUnique({
        where: { id: dto.destinationId },
    });
    if (!destination) {
        throw new NotFoundException(`Không tìm thấy điểm đến với id ${dto.destinationId}.`);
    }

    // 2. Chống spam: User đã đánh giá địa điểm này chưa
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

  
    if (files && files.length > 0) {
        const uploadedUrls: string[] = [];
        for (const file of files) {
            const url = await this.storageService.uploadFile(
                file,
                'review_image',               // Bucket riêng của review
                `dest-${dto.destinationId}`,    // Thư mục chia theo ID địa điểm
            );
            uploadedUrls.push(url);
        }
        dto.images = [...(dto.images || []), ...uploadedUrls];
    }

    // 4. Lưu vào Database
    const created = await this.reviewRepository.create(userId, dto);
    await this.updateDestinationAvgRating(dto.destinationId);
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

  // 6b. [ADMIN] Lấy toàn bộ review đã duyệt (mọi điểm đến) cho trang Kiểm duyệt nội dung
  async getApprovedReviews(): Promise<any[]> {
    return this.reviewRepository.findApprovedReviews();
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
  const destination = await this.prisma.destination.findUnique({
    where: { id: destinationId },
    select: { avgRating: true },
  });
  if (!destination) return;
  const { sumRating, totalReviews } = await this.reviewRepository.calculateAvgRating(destinationId);
  if (totalReviews === 0) return;
  const initialRating = destination.avgRating ? Number(destination.avgRating) : 0;
  let newAvgRating = 0;
  if (initialRating > 0) {
    newAvgRating = (initialRating + sumRating) / (1 + totalReviews);
  } else {
    newAvgRating = sumRating / totalReviews;
  }
  await this.prisma.destination.update({
    where: { id: destinationId },
    data: {
      avgRating: Number(newAvgRating.toFixed(1)),
    },
  });
}
}
