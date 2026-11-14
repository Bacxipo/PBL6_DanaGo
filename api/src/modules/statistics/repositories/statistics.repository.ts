import { Injectable } from '@nestjs/common';
import { ContentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';

export interface ItineraryRow {
  startDate: Date;
  endDate: Date;
  budget: unknown; // Decimal | null (Prisma trả Decimal, chuyển bằng Number())
  createdAt: Date;
}

export interface DestinationInfo {
  id: number;
  name: string;
  district: string;
  avgRating: unknown; // Decimal | null
  status: ContentStatus;
  category: { id: number; name: string; iconUrl: string | null } | null;
}

interface CountByDestination {
  destinationId: number;
  _count: { _all: number };
}

// Chỉ đọc dữ liệu cho trang Thống kê & Báo cáo của WebAdmin
@Injectable()
export class StatisticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Lịch trình tạo từ mốc `since` trở đi
  findItinerariesSince(since: Date): Promise<ItineraryRow[]> {
    return this.prisma.itinerary.findMany({
      where: { createdAt: { gte: since } },
      select: { startDate: true, endDate: true, budget: true, createdAt: true },
    });
  }

  // Du khách (role USER) đăng ký từ mốc `since`
  countNewUsersSince(since: Date): Promise<number> {
    return this.prisma.user.count({ where: { role: UserRole.USER, createdAt: { gte: since } } });
  }

  // Đánh giá gửi lên từ mốc `since` (không tính đánh giá bị từ chối)
  countReviewsSince(since: Date): Promise<number> {
    return this.prisma.review.count({
      where: { createdAt: { gte: since }, status: { not: ContentStatus.REJECTED } },
    });
  }

  // Số lần mỗi điểm đến được đưa vào lịch trình (lịch trình tạo từ `since`)
  async countItineraryItemsByDestination(since: Date): Promise<CountByDestination[]> {
    // Mục lịch trình không gắn điểm đến (vd nơi lưu trú, ghi chú) bị bỏ qua
    return this.prisma.itineraryItem.groupBy({
      by: ['destinationId'],
      where: { destinationId: { not: null }, itinerary: { createdAt: { gte: since } } },
      _count: { _all: true },
    });
  }

  // Lượt yêu thích mới của mỗi điểm đến
  async countFavoritesByDestination(since: Date): Promise<CountByDestination[]> {
    return this.prisma.favorite.groupBy({
      by: ['destinationId'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    });
  }

  // Đánh giá mới của mỗi điểm đến (không tính đánh giá bị từ chối)
  async countReviewsByDestination(since: Date): Promise<CountByDestination[]> {
    return this.prisma.review.groupBy({
      by: ['destinationId'],
      where: { createdAt: { gte: since }, status: { not: ContentStatus.REJECTED } },
      _count: { _all: true },
    });
  }

  findDestinations(ids: number[]): Promise<DestinationInfo[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.prisma.destination.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        district: true,
        avgRating: true,
        status: true,
        category: { select: { id: true, name: true, iconUrl: true } },
      },
    });
  }
}
