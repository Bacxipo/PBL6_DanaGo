import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationMapper } from '../mappers/notification.mapper';
import { NotificationResponseDto } from '../dto/notification-response.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async getUserNotifications(userId: number): Promise<NotificationResponseDto[]> {
    const list = await this.notificationRepository.findByUserId(userId);
    return list.map((item) => NotificationMapper.toResponseDto(item));
  }

  async markAsRead(id: number): Promise<NotificationResponseDto> {
    try {
      const item = await this.notificationRepository.markAsRead(id);
      return NotificationMapper.toResponseDto(item);
    } catch {
      throw new NotFoundException(`Notification with ID ${id} not found.`);
    }
  }

  async markAllAsRead(userId: number) {
    return this.notificationRepository.markAllAsRead(userId);
  }

  async deleteNotification(id: number) {
    try {
      return await this.notificationRepository.deleteNotification(id);
    } catch {
      throw new NotFoundException(`Notification with ID ${id} not found.`);
    }
  }
}
