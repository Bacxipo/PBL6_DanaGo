export class NotificationEntity {
  id: number;
  userId: number;
  type: 'ITINERARY_REMINDER' | 'PROMOTION';
  title?: string;
  content?: string;
  isRead: boolean;
  createdAt: Date;
}
