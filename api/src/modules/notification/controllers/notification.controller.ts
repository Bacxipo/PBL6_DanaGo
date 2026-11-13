import { Controller, Get, Param } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { NotificationResponseDto } from '../dto/notification-response.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('user/:userId')
  async getUserNotifications(@Param('userId') userId: string): Promise<NotificationResponseDto[]> {
    return this.notificationService.getUserNotifications(+userId);
  }
}
