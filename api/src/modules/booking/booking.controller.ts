import { Controller, Post, Body } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body('tourId') tourId: string) {
    return this.bookingService.createBooking(tourId);
  }
}
