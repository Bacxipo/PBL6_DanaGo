import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  async processPayment(bookingId: string, amount: number) {
    return {
      status: 'PAID',
      transactionId: `TX-${Date.now()}`,
      bookingId,
      amount,
      paidAt: new Date().toISOString(),
    };
  }
}
