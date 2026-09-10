import { Injectable } from '@nestjs/common';

@Injectable()
export class BookingService {
  async createBooking(tourId: string) {
    return {
      status: 'success',
      bookingId: `BK-${Date.now()}`,
      tourId,
      createdAt: new Date().toISOString(),
    };
  }
}
