import { CONTENT_STATUSES, type AuthResponse, type Category, type CategoryInput, type ContentStatus, type CreateEventInput, type CreateUserInput, type Destination, type DestinationInput, type EventInput, type EventItem, type FeedPost, type Review, type Trends, type User, type UserRole, type UserStatus } from './types';

// Chưa cấu hình NEXT_PUBLIC_API_URL -> chạy chế độ DỮ LIỆU MẪU (lib/mock.ts), không cần backend hay database.
// Muốn dùng backend thật: đặt NEXT_PUBLIC_API_URL=http://localhost:5000 trong WebAdmin/.env.local
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
export const USE_MOCK = !API_BASE_URL;

// ───────── Phiên đăng nhập (token + thông tin user) ─────────
// localStorage có thể bị chặn (chế độ riêng tư...) nên bọc try/catch.
// Khóa lưu phiên tách theo chế độ để token của backend thật không lẫn sang dữ liệu mẫu (và ngược lại).
const MODE = USE_MOCK ? 'mock' : 'api';
const TOKEN_KEY = `danago_admin_token_${MODE}`;
const USER_KEY = `danago_admin_user_${MODE}`;

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const tokenStorage = {
  get: () => read(TOKEN_KEY),
  getUser: (): User | null => {
    try {
      return JSON.parse(read(USER_KEY) ?? 'null');
    } catch {
      return null;
    }
  },
  set: (token: string, user: User) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  }
};

// ───────── HTTP client ─────────

// Thông báo khi route chưa tồn tại ở backend; các trang dùng isMissingApi để vẫn hiện giao diện
export const MISSING_API_PREFIX = 'Backend chưa có API này';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Gọi khi token hết hạn / không hợp lệ (AuthProvider đăng ký để đẩy về trang đăng nhập)
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

type Query = Record<string, string | number | undefined>;

// NestJS trả lỗi dạng { message: string | string[] }
async function readError(res: Response) {
  try {
    const { message } = await res.json();
    if (message) return Array.isArray(message) ? message.join('\n') : String(message);
  } catch {}
  return `Lỗi ${res.status}: ${res.statusText || 'không xác định'}`;
}

async function request<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
  if (USE_MOCK) {
    try {
      return await (await import('./mock')).mockRequest<T>(method, path, body, query);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401 && tokenStorage.get()) onUnauthorized?.();
      throw e;
    }
  }

  const url = new URL(path, API_BASE_URL);
  Object.entries(query ?? {}).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, String(v)));

  const token = tokenStorage.get();
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: { ...(body !== undefined && { 'Content-Type': 'application/json' }), ...(token && { Authorization: `Bearer ${token}` }) },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError(0, `Không kết nối được máy chủ API (${API_BASE_URL}). Kiểm tra backend đã chạy chưa.`);
  }

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.();
    const message = await readError(res);
    // NestJS trả "Cannot GET /đường-dẫn" khi route chưa tồn tại
    throw new ApiError(res.status, res.status === 404 && message.startsWith('Cannot ') ? `${MISSING_API_PREFIX} (${method} ${path}).` : message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, undefined, query),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path)
};

// ───────── Nội dung có trạng thái duyệt (điểm đến, sự kiện, bài đăng) ─────────
// Backend mặc định chỉ trả APPROVED nên muốn lấy hết phải gọi từng trạng thái.
const listAll = async <T extends { id: number }>(path: string) =>
  (await Promise.all(CONTENT_STATUSES.map((status) => api.get<T[]>(path, { status })))).flat().sort((a, b) => b.id - a.id);

const setStatus = <T>(path: string, id: number, status: ContentStatus) => api.patch<T>(`${path}/${id}/status`, { status });

// Backend luôn tạo ở trạng thái PENDING; nội dung do admin/staff tạo thì duyệt luôn
const createApproved = async <T extends { id: number }>(path: string, body: unknown) => setStatus<T>(path, (await api.post<T>(path, body)).id, 'APPROVED');

// ───────── Endpoint theo module backend ─────────
export const authApi = {
  login: (emailOrUsername: string, password: string) => api.post<AuthResponse>('/identity/auth/login', { emailOrUsername, password })
};

// Chỉ ADMIN gọi được
export const userApi = {
  list: () => api.get<User[]>('/identity/users'),
  create: (input: CreateUserInput) => api.post<User>('/identity/users', input),
  setStatus: (id: number, status: UserStatus) => api.patch<User>(`/identity/users/${id}/status`, { status }),
  setRole: (id: number, role: UserRole) => api.patch<User>(`/identity/users/${id}/role`, { role })
};

export const destinationApi = {
  listAll: () => listAll<Destination>('/destinations'),
  listByStatus: (status: ContentStatus) => api.get<Destination[]>('/destinations', { status }),
  create: (input: DestinationInput) => createApproved<Destination>('/destinations', input),
  update: (id: number, input: DestinationInput) => api.put<Destination>(`/destinations/${id}`, input),
  setStatus: (id: number, status: ContentStatus) => setStatus<Destination>('/destinations', id, status),
  remove: (id: number) => api.delete(`/destinations/${id}`)
};

export const eventApi = {
  listAll: () => listAll<EventItem>('/events'),
  create: (input: CreateEventInput) => createApproved<EventItem>('/events', input),
  update: (id: number, input: EventInput) => api.put<EventItem>(`/events/${id}`, input),
  setStatus: (id: number, status: ContentStatus) => setStatus<EventItem>('/events', id, status),
  remove: (id: number) => api.delete(`/events/${id}`)
};

export const categoryApi = {
  list: () => api.get<Category[]>('/categories'),
  create: (input: CategoryInput) => api.post<Category>('/categories', input),
  update: (id: number, input: CategoryInput) => api.put<Category>(`/categories/${id}`, input),
  remove: (id: number) => api.delete(`/categories/${id}`)
};

export const reviewApi = {
  listByStatus: (status: ContentStatus) => api.get<Review[]>('/community/reviews/manage', { status }),
  setStatus: (id: number, status: ContentStatus) => setStatus<Review>('/community/reviews', id, status)
};

export const statsApi = {
  trends: (days: number) => api.get<Trends>('/statistics/trends', { days })
};

export const feedApi = {
  listByStatus: (status: ContentStatus) => api.get<FeedPost[]>('/feed/posts', { status }),
  setStatus: (id: number, status: ContentStatus) => setStatus<FeedPost>('/feed/posts', id, status)
};
