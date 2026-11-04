import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationMapper } from '../mappers/notification.mapper';
import { NotificationResponseDto } from '../dto/notification-response.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async getUserNotifications(userId: number): Promise<NotificationResponseDto[]> {
    const list = await this.notificationRepository.findByUserId(userId);
    return list.map(item => NotificationMapper.toResponseDto(item));
  }
}
