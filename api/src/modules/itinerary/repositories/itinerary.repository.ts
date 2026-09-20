import { Injectable } from '@nestjs/common';
import { ItineraryEntity } from '../entities/itinerary.entity';

@Injectable()
export class ItineraryRepository {
  async findByUserId(userId: number): Promise<ItineraryEntity[]> {
    return [
      {
        id: 101,
        userId,
        title: 'Chuyến đi Đà Nẵng 3N2Đ',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-03'),
        budget: 5000000,
        createdAt: new Date(),
      },
    ];
  }
}
