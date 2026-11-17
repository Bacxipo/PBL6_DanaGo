export class NotificationEntity {
  id: number;
  userId: number;
  type: string;
  title?: string | null;
  content?: string | null;
  referenceType?: string | null;
  referenceId?: number | null;
  isRead: boolean;
  createdAt: Date;
}
