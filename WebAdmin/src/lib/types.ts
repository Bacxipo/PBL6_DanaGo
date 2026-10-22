// Kiểu dữ liệu khớp backend: api/prisma/schema.prisma và api/src/modules/*
// (Prisma trả null cho cột rỗng, một số DTO trả undefined)
import { todayIso } from './utils';

// ───────── Dùng chung ─────────
export type UserRole = 'ADMIN' | 'STAFF' | 'USER';
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'PENDING';
export type ContentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export const CONTENT_STATUSES: ContentStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];
export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối'
};
export const DISTRICTS = ['Hải Châu', 'Sơn Trà', 'Ngũ Hành Sơn', 'Thanh Khê', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Vang'];

// ───────── identity ─────────
export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface CreateUserInput {
  username: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Quản trị viên',
  STAFF: 'Nhân viên kiểm duyệt',
  USER: 'Du khách'
};

export const canAccessAdmin = (role?: UserRole) => role === 'ADMIN' || role === 'STAFF';

// ───────── destination ─────────
export interface Destination {
  id: number;
  name: string;
  description?: string;
  district: string;
  latitude?: number;
  longitude?: number;
  addressUrl?: string;
  categoryId?: number;
  ticketPrice?: string; // VARCHAR trong DB, vd "Miễn phí", "900.000đ"
  openHours?: string;
  avgRating: number;
  status: ContentStatus;
  createdBy?: number;
  createdAt: string;
}

// Backend dùng forbidNonWhitelisted: gửi field ngoài DTO sẽ bị 400
export interface DestinationInput {
  name: string;
  description?: string;
  district: string;
  latitude?: number;
  longitude?: number;
  addressUrl?: string;
  ticketPrice?: string;
  openHours?: string;
}

// ───────── category ─────────
export interface Category {
  id: number;
  name: string;
  iconUrl?: string;
  destinationCount: number;
}
export type CategoryInput = { name: string; iconUrl?: string };

// ───────── statistics ─────────
export interface Trends {
  days: number;
  itineraries: number;
  newUsers: number;
  reviews: number;
  avgTripDays: number;
  avgBudget: number;
  itineraryTrend: { label: string; from: string; to: string; count: number }[];
  categories: { id: number; name: string; iconUrl?: string; count: number }[];
  districts: { name: string; count: number }[];
  topDestinations: { id: number; name: string; district: string; categoryName?: string; avgRating: number; inItineraries: number; favorites: number; reviews: number }[];
}

// ───────── event ─────────
export interface EventItem {
  id: number;
  name: string;
  description: string | null;
  destinationId: number | null;
  locationNote: string | null;
  startDate: string; // ISO, vd 2026-10-01T00:00:00.000Z
  endDate: string;
  ticketPrice: string | number; // Decimal -> chuỗi
  status: ContentStatus;
  createdBy: number | null;
  createdAt: string;
  images: { id: number; imageUrl: string }[];
  destination: { id: number; name: string; district: string } | null;
}

export interface EventInput {
  name: string;
  description?: string;
  destinationId?: number;
  locationNote?: string;
  startDate: string;
  endDate: string;
  ticketPrice?: number;
}
export type CreateEventInput = EventInput & { images?: string[] }; // backend chỉ nhận ảnh khi tạo

export type EventTimeline = 'HAPPENING' | 'UPCOMING' | 'ENDED';
export const TIMELINE_LABEL: Record<EventTimeline, string> = {
  HAPPENING: 'Đang diễn ra',
  UPCOMING: 'Sắp diễn ra',
  ENDED: 'Đã kết thúc'
};

// DB không lưu tiến độ; tính theo ngày hiện tại
export function getTimeline({ startDate, endDate }: Pick<EventItem, 'startDate' | 'endDate'>): EventTimeline {
  const today = todayIso();
  if (today < startDate.slice(0, 10)) return 'UPCOMING';
  if (today > endDate.slice(0, 10)) return 'ENDED';
  return 'HAPPENING';
}

// ───────── review (đánh giá của du khách) ─────────
export interface Review {
  id: number;
  userId: number;
  destinationId: number;
  rating: number;
  comment?: string;
  status: ContentStatus;
  createdAt: string;
  user?: { id: number; fullName: string; avatarUrl?: string };
  destination?: { id: number; name: string };
  images: string[];
}

// ───────── feed (bài đăng cộng đồng) ─────────
export interface FeedPost {
  id: number;
  userId: number;
  destinationId: number | null;
  content: string;
  status: ContentStatus;
  createdAt: string;
  images: { id: number; imageUrl: string }[];
  user: { id: number; username: string; fullName: string; avatarUrl: string | null };
  _count: { likes: number; comments: number };
}
