import { Injectable } from '@nestjs/common';
import { NotificationEntity } from '../entities/notification.entity';

@Injectable()
export class NotificationRepository {
  async findByUserId(userId: number): Promise<NotificationEntity[]> {
    return [
      {
        id: 1,
        userId,
        type: 'ITINERARY_REMINDER',
        title: 'Nhắc nhở chuyến đi',
        content: 'Chuyến đi Đà Nẵng của bạn sẽ bắt đầu vào ngày mai!',
        isRead: false,
        createdAt: new Date(),
      },
    ];
  }
}
