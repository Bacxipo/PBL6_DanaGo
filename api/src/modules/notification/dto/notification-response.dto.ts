export class NotificationResponseDto {
  id: number;
  type: string;
  title?: string;
  content?: string;
  isRead: boolean;
  createdAt: string;
}
