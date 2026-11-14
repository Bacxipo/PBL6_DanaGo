import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { StatisticsRepository } from '../repositories/statistics.repository';
import { TrendsResponseDto } from '../dto/trends-response.dto';

const DAY_MS = 86_400_000;
const VN_OFFSET_MS = 7 * 60 * 60 * 1000; // giờ Việt Nam (UTC+7), server chạy giờ UTC
const DEFAULT_DAYS = 180;
const MAX_DAYS = 730;
const TOP_LIMIT = 10;

interface Bucket {
  label: string;
  from: string; // YYYY-MM-DD (ngày đầu cột, giờ VN)
  to: string; // YYYY-MM-DD (ngày cuối cột, giờ VN)
  start: number; // mốc thời gian bắt đầu (gồm)
  end: number; // mốc thời gian kết thúc (không gồm)
  count: number;
}

// Mốc 00:00 giờ VN của ngày (y, m, d) tính ra thời điểm thật (ms)
const vnMidnight = (year: number, month: number, day: number) => Date.UTC(year, month, day) - VN_OFFSET_MS;
// Ngày lịch theo giờ VN của một thời điểm
const vnDate = (ms: number) => new Date(ms + VN_OFFSET_MS);
const isoDay = (ms: number) => vnDate(ms).toISOString().slice(0, 10);

const round = (value: number, digits: number) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

@Injectable()
export class StatisticsService {
  constructor(private readonly statisticsRepository: StatisticsRepository) {}

  async getTrends(rawDays: number): Promise<TrendsResponseDto> {
    const days = Math.min(Math.max(Math.trunc(rawDays) || DEFAULT_DAYS, 1), MAX_DAYS);
    const buckets = this.buildBuckets(days, Date.now());
    // Mọi chỉ số tính từ đầu cột biểu đồ đầu tiên, nên tổng các cột luôn bằng ô "Lịch trình tạo mới"
    const since = new Date(buckets[0].start);

    const [itineraries, newUsers, reviews, itemCounts, favoriteCounts, reviewCounts] = await Promise.all([
      this.statisticsRepository.findItinerariesSince(since),
      this.statisticsRepository.countNewUsersSince(since),
      this.statisticsRepository.countReviewsSince(since),
      this.statisticsRepository.countItineraryItemsByDestination(since),
      this.statisticsRepository.countFavoritesByDestination(since),
      this.statisticsRepository.countReviewsByDestination(since),
    ]);

    // Cột biểu đồ + thời lượng + ngân sách
    let totalTripDays = 0;
    let budgetSum = 0;
    let budgetCount = 0;
    for (const itinerary of itineraries) {
      const t = itinerary.createdAt.getTime();
      const bucket = buckets.find((b) => t >= b.start && t < b.end);
      if (bucket) bucket.count += 1;

      const tripDays = Math.round((itinerary.endDate.getTime() - itinerary.startDate.getTime()) / DAY_MS) + 1;
      totalTripDays += Math.max(tripDays, 1);

      const budget = Number(itinerary.budget);
      if (Number.isFinite(budget) && budget > 0) {
        budgetSum += budget;
        budgetCount += 1;
      }
    }

    // Gom số liệu theo điểm đến rồi theo danh mục / quận
    const inItineraries = new Map(itemCounts.map((r) => [r.destinationId, r._count._all]));
    const favorites = new Map(favoriteCounts.map((r) => [r.destinationId, r._count._all]));
    const reviewsByDestination = new Map(reviewCounts.map((r) => [r.destinationId, r._count._all]));

    const destinationIds = [...new Set([...inItineraries.keys(), ...favorites.keys(), ...reviewsByDestination.keys()])];
    const destinations = await this.statisticsRepository.findDestinations(destinationIds);

    const categories = new Map<number, { id: number; name: string; iconUrl?: string; count: number }>();
    const districts = new Map<string, number>();
    for (const destination of destinations) {
      const count = inItineraries.get(destination.id) ?? 0;
      if (count === 0) continue;
      if (destination.category) {
        const current = categories.get(destination.category.id);
        if (current) current.count += count;
        else categories.set(destination.category.id, { id: destination.category.id, name: destination.category.name, iconUrl: destination.category.iconUrl ?? undefined, count });
      }
      districts.set(destination.district, (districts.get(destination.district) ?? 0) + count);
    }

    const topDestinations = destinations
      .filter((d) => d.status === ContentStatus.APPROVED)
      .map((d) => ({
        id: d.id,
        name: d.name,
        district: d.district,
        categoryName: d.category?.name,
        avgRating: Number(d.avgRating ?? 0),
        inItineraries: inItineraries.get(d.id) ?? 0,
        favorites: favorites.get(d.id) ?? 0,
        reviews: reviewsByDestination.get(d.id) ?? 0,
      }))
      .sort((a, b) => b.inItineraries - a.inItineraries || b.favorites - a.favorites || b.reviews - a.reviews || b.avgRating - a.avgRating || a.name.localeCompare(b.name, 'vi'))
      .slice(0, TOP_LIMIT);

    return {
      days,
      itineraries: itineraries.length,
      newUsers,
      reviews,
      avgTripDays: itineraries.length ? round(totalTripDays / itineraries.length, 2) : 0,
      avgBudget: budgetCount ? Math.round(budgetSum / budgetCount) : 0,
      itineraryTrend: buckets.map(({ label, from, to, count }) => ({ label, from, to, count })),
      categories: [...categories.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'vi')),
      districts: [...districts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'vi')),
      topDestinations,
    };
  }

  // ≤31 ngày: cột theo tuần (7 ngày kết thúc hôm nay); dài hơn: cột theo tháng dương lịch.
  // Cách chia và nhãn khớp với giao diện WebAdmin (lib/AnalyticsPage.emptyBuckets).
  private buildBuckets(days: number, nowMs: number): Bucket[] {
    const today = vnDate(nowMs);
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth();
    const day = today.getUTCDate();

    if (days <= 31) {
      const tomorrow = vnMidnight(year, month, day) + DAY_MS;
      const since = tomorrow - days * DAY_MS;
      const weeks = Math.ceil(days / 7);
      return Array.from({ length: weeks }, (_, i) => {
        const end = tomorrow - (weeks - 1 - i) * 7 * DAY_MS;
        const start = Math.max(since, end - 7 * DAY_MS);
        const last = vnDate(end - 1);
        return { label: `${last.getUTCDate()}/${last.getUTCMonth() + 1}`, from: isoDay(start), to: isoDay(end - 1), start, end, count: 0 };
      });
    }

    const months = Math.max(1, Math.round(days / 30));
    return Array.from({ length: months }, (_, i) => {
      const offset = months - 1 - i;
      const start = vnMidnight(year, month - offset, 1);
      const end = vnMidnight(year, month - offset + 1, 1);
      return { label: `T${vnDate(start).getUTCMonth() + 1}`, from: isoDay(start), to: isoDay(end - 1), start, end, count: 0 };
    });
  }
}
