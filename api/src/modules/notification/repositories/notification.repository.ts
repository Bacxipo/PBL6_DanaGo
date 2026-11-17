import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: number): Promise<NotificationEntity[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: number): Promise<NotificationEntity> {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteNotification(id: number) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async create(data: {
    userId: number;
    type: NotificationType;
    title?: string;
    content?: string;
    referenceType?: string;
    referenceId?: number;
  }): Promise<NotificationEntity> {
    return this.prisma.notification.create({
      data,
    });
  }
}
