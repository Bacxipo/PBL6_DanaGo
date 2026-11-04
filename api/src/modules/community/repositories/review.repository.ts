import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { ReviewEntity } from '../entities/review.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Lấy danh sách review đã được DUYỆT (APPROVED) cho trang chi tiết điểm đến
  async findByDestinationId(destinationId: number): Promise<ReviewEntity[]> {
    return this.prisma.review.findMany({
      where: {
        destinationId,
        status: ContentStatus.APPROVED,
      },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 2. Tạo review mới (Mặc định là PENDING chờ admin duyệt)
  async create(userId: number, dto: CreateReviewDto): Promise<ReviewEntity> {
    return this.prisma.review.create({
      data: {
        userId,
        destinationId: dto.destinationId,
        rating: dto.rating,
        comment: dto.comment,
        status: ContentStatus.PENDING,
        images:
          dto.images && dto.images.length > 0
            ? {
                create: dto.images.map((url) => ({
                  imageUrl: url,
                  uploadedBy: userId,
                })),
              }
            : undefined,
      },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  // 3. Lấy danh sách review của user (Thấy hết bài của mình: PENDING, APPROVED, REJECTED)
  async findByUserId(userId: number) {
    return this.prisma.review.findMany({
      where: {
        userId,
      },
      include: {
        destination: {
          select: {
            id: true,
            name: true,
            district: true,
          },
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 4. Tìm review theo ID
  async findById(id: number) {
    return this.prisma.review.findUnique({
      where: {
        id,
      },
      include: {
        images: true,
      },
    });
  }

  // 5. Cập nhật nội dung review (User sửa)
  async update(id: number, userId: number, dto: UpdateReviewDto) {
    return this.prisma.review.update({
      where: { id },
      data: {
        rating: dto.rating,
        comment: dto.comment,
        status: ContentStatus.PENDING, // Khi người dùng sửa bài -> chuyển lại về PENDING để admin duyệt lại
        images:
          dto.images && dto.images.length > 0
            ? {
                deleteMany: {},
                create: dto.images.map((url) => ({
                  imageUrl: url,
                  uploadedBy: userId,
                })),
              }
            : undefined,
      },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  // 6. Xóa review
  async delete(id: number) {
    return this.prisma.review.delete({
      where: {
        id,
      },
    });
  }

  // 7. Cập nhật trạng thái duyệt review (Dành cho Admin)
  async updateStatus(id: number, status: ContentStatus) {
    return this.prisma.review.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  // 8. Lấy danh sách review chờ duyệt (Dành cho Admin)
  async findPendingReviews() {
    return this.prisma.review.findMany({
      where: {
        status: ContentStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        destination: {
          select: {
            id: true,
            name: true,
            district: true,
          },
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Bài nào gửi trước duyệt trước (FIFO)
      },
    });
  }

  // 9. Tính điểm sao trung bình (Chỉ tính các bài đã được APPROVED)
  async calculateAvgRating(destinationId: number) {
    const result = await this.prisma.review.aggregate({
      where: {
        destinationId,
        status: ContentStatus.APPROVED,
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });
    return {
      avgRating: result._avg.rating ?? 0,
      totalReviews: result._count.rating,
    };
  }
}
