export class NotificationResponseDto {
  id: number;
  type: string;
  title?: string;
  content?: string;
  referenceType?: string;
  referenceId?: number;
  isRead: boolean;
  createdAt: string;
}
