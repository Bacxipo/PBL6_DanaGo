import { apiRequest } from './feed-api';

export interface EventImage {
  id: number;
  imageUrl: string;
}

// Khớp dữ liệu GET /events và GET /events/:id của backend
export interface EventItem {
  id: number;
  name: string;
  description: string | null;
  destinationId: number | null;
  locationNote: string | null;
  startDate: string; // ISO, vd 2026-11-18T00:00:00.000Z (cột DATE)
  endDate: string;
  ticketPrice: string | number | null; // Decimal -> chuỗi, 0 = miễn phí
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  images: EventImage[];
  destination?: { id: number; name: string; district: string } | null;
  isFavorited?: boolean; // chỉ đúng khi gọi kèm token
}

export type EventTimeline = 'HAPPENING' | 'UPCOMING' | 'ENDED';

// Khách chỉ nhận sự kiện đã duyệt; truyền token để có isFavorited của người đang đăng nhập
export function getEvents(token?: string | null): Promise<EventItem[]> {
  return apiRequest<EventItem[]>('/events', { token });
}

export function getEvent(id: number | string, token?: string | null): Promise<EventItem> {
  return apiRequest<EventItem>(`/events/${id}`, { token });
}

// Bấm lần 1 = yêu thích, bấm lần nữa = bỏ yêu thích
export function toggleEventFavorite(id: number, token: string): Promise<{ favorited: boolean }> {
  return apiRequest<{ favorited: boolean }>(`/events/${id}/favorite`, { method: 'POST', token });
}

// ───────── Tiện ích hiển thị ─────────
const DAY_MS = 86_400_000;
const dayKey = (iso: string) => iso.slice(0, 10); // YYYY-MM-DD

// Hôm nay theo giờ máy người dùng, dạng YYYY-MM-DD
export const todayKey = () => new Date().toLocaleDateString('en-CA');

export function getEventTimeline(event: Pick<EventItem, 'startDate' | 'endDate'>, today = todayKey()): EventTimeline {
  if (today < dayKey(event.startDate)) return 'UPCOMING';
  if (today > dayKey(event.endDate)) return 'ENDED';
  return 'HAPPENING';
}

// Số ngày nữa sự kiện bắt đầu (0 = hôm nay)
export function daysUntilStart(event: Pick<EventItem, 'startDate'>, today = todayKey()): number {
  return Math.round((Date.parse(dayKey(event.startDate)) - Date.parse(today)) / DAY_MS);
}

function formatDay(iso: string, withYear: boolean) {
  const [year, month, day] = dayKey(iso).split('-');
  return withYear ? `${day}/${month}/${year}` : `${day}/${month}`;
}

// "24/11/2026" (1 ngày) | "18/11 – 24/11/2026" (cùng năm) | "28/12/2026 – 03/01/2027"
export function formatEventDates(event: Pick<EventItem, 'startDate' | 'endDate'>): string {
  const sameDay = dayKey(event.startDate) === dayKey(event.endDate);
  if (sameDay) return formatDay(event.endDate, true);
  const sameYear = dayKey(event.startDate).slice(0, 4) === dayKey(event.endDate).slice(0, 4);
  return sameYear
    ? `${formatDay(event.startDate, false)} – ${formatDay(event.endDate, true)}`
    : `${formatDay(event.startDate, true)} – ${formatDay(event.endDate, true)}`;
}

export function formatEventPrice(price: EventItem['ticketPrice']): string {
  const value = Number(price);
  return Number.isFinite(value) && value > 0 ? `${value.toLocaleString('vi-VN')}đ` : 'Miễn phí';
}

export function eventLocation(event: Pick<EventItem, 'destination' | 'locationNote'>): string {
  return [event.destination?.name, event.locationNote].filter(Boolean).join(' · ') || 'Đà Nẵng';
}

export const eventCover = (event: Pick<EventItem, 'images'>): string | null => event.images?.[0]?.imageUrl ?? null;

export function eventMapUrl(event: Pick<EventItem, 'destination' | 'locationNote'>): string {
  const query = event.locationNote || event.destination?.name || 'Đà Nẵng';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query}, Đà Nẵng`)}`;
}
