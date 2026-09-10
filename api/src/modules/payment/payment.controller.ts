import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  pay(@Body('bookingId') bookingId: string, @Body('amount') amount: number) {
    return this.paymentService.processPayment(bookingId, amount);
  }
}
