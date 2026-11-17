import { NotificationEntity } from '../entities/notification.entity';
import { NotificationResponseDto } from '../dto/notification-response.dto';

export class NotificationMapper {
  static toResponseDto(entity: NotificationEntity): NotificationResponseDto {
    return {
      id: entity.id,
      type: entity.type,
      title: entity.title ?? undefined,
      content: entity.content ?? undefined,
      referenceType: entity.referenceType ?? undefined,
      referenceId: entity.referenceId ?? undefined,
      isRead: entity.isRead,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
