import { NotificationEntity } from '../entities/notification.entity';
import { NotificationResponseDto } from '../dto/notification-response.dto';

export class NotificationMapper {
  static toResponseDto(entity: NotificationEntity): NotificationResponseDto {
    return {
      id: entity.id,
      type: entity.type,
      title: entity.title,
      content: entity.content,
      isRead: entity.isRead,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
