import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { NotificationResponseDto } from '../dto/notification-response.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyNotifications(
    @CurrentUser('sub') userId: number,
  ): Promise<NotificationResponseDto[]> {
    return this.notificationService.getUserNotifications(userId);
  }

  @Get('user/:userId')
  async getUserNotifications(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<NotificationResponseDto[]> {
    return this.notificationService.getUserNotifications(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  async markAllAsRead(@CurrentUser('sub') userId: number) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Patch('user/:userId/read-all')
  async markAllAsReadByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.markAsRead(id);
  }

  @Delete(':id')
  async deleteNotification(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.deleteNotification(id);
  }
}
