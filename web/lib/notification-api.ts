import { apiRequest } from './feed-api';

export interface NotificationItem {
  id: number;
  type: string;
  title?: string;
  content?: string;
  referenceType?: string;
  referenceId?: number;
  isRead: boolean;
  createdAt: string;
}

export function getMyNotifications(token: string) {
  return apiRequest<NotificationItem[]>('/notifications/me', { token });
}

export function markNotificationAsRead(id: number, token: string) {
  return apiRequest<NotificationItem>(`/notifications/${id}/read`, { method: 'PATCH', token });
}

export function markAllNotificationsAsRead(token: string) {
  return apiRequest('/notifications/read-all', { method: 'PATCH', token });
}

export function deleteNotification(id: number, token: string) {
  return apiRequest(`/notifications/${id}`, { method: 'DELETE', token });
}
