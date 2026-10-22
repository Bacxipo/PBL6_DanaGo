// Chế độ DỮ LIỆU MẪU của WebAdmin: bật khi chưa cấu hình NEXT_PUBLIC_API_URL (xem lib/api.ts).
// Đây là "máy chủ giả" chạy ngay trong trình duyệt, trả đúng định dạng như API thật của backend nên các trang
// không phải sửa gì. Thao tác thêm/sửa/duyệt hoạt động bình thường, nhưng dữ liệu về lại ban đầu khi tải lại trang.
// Nội dung đọc THẲNG từ web du khách (web/src/database/data.js): 8 địa điểm + ảnh, danh mục, đánh giá, bài đăng.
// Nếu web du khách bỏ file đó (khi chuyển sang API), chép dữ liệu cần dùng về đây.
import { categoriesData, initialPosts, placesData, quickSearchPlacesData, reviews as sampleReviews } from '../../../web/src/database/data';
import { ApiError, tokenStorage } from './api';
import { CONTENT_STATUSES, type Category, type ContentStatus, type Destination, type EventItem, type FeedPost, type Review, type Trends, type User, type UserRole, type UserStatus } from './types';

const MIN = 60_000;
const DAY = 86_400_000;
const ago = (minutes: number) => new Date(Date.now() - minutes * MIN).toISOString();
const dateOffset = (days: number) => {
  const d = new Date(Date.now() + days * DAY);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const photo = (id: string) => `https://images.unsplash.com/${id}?w=600&auto=format&fit=crop&q=60`;

// ───────── Dữ liệu gốc ─────────
type MockUser = User & { password: string };
const user = (id: number, username: string, fullName: string, role: UserRole, status: UserStatus, daysAgo: number, password = '123456', avatarUrl?: string): MockUser => ({
  id, username, fullName, email: `${username}@${role === 'USER' ? 'gmail.com' : 'danago.vn'}`, role, status, avatarUrl, createdAt: ago(daysAgo * 1440), password
});

const USERS: MockUser[] = [
  user(1, 'admin', 'Admin', 'ADMIN', 'ACTIVE', 120, 'admin123'),
  user(2, 'staff', 'Trần Kiểm Duyệt', 'STAFF', 'ACTIVE', 90, 'staff123'),
  user(3, 'nguyenvana', 'Nguyễn Văn A', 'USER', 'ACTIVE', 60),
  user(4, 'tranthib', 'Trần Thị B', 'USER', 'ACTIVE', 45),
  user(5, 'lehoangc', 'Lê Hoàng C', 'USER', 'ACTIVE', 30),
  user(6, 'nchuc', 'nChuc_', 'USER', 'ACTIVE', 21, '123456', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80'),
  user(7, 'minhhoang', 'Minh Hoàng', 'USER', 'ACTIVE', 12, '123456', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80'),
  user(8, 'thutrang', 'Thu Trang', 'USER', 'ACTIVE', 5, '123456', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80'),
  user(9, 'spambot', 'Hoàng Thị Spam', 'USER', 'LOCKED', 40),
  user(10, 'phamquangminh', 'Phạm Quang Minh', 'USER', 'PENDING', 0)
];

const CATEGORY_ICON: Record<string, string> = { 'Biển': 'waves', 'Văn hóa': 'landmark', 'Ẩm thực': 'utensils', 'Giải trí': 'sparkles' };
const CATEGORIES: Omit<Category, 'destinationCount'>[] = [
  ...categoriesData.filter((c) => c.name !== 'Tất cả').map((c) => ({ id: c.id, name: c.name, iconUrl: CATEGORY_ICON[c.name] })),
  { id: categoriesData.length, name: 'Cafe & Check-in', iconUrl: 'coffee' }
];

// Ảnh trong data.js do bundler tạo ra (object có .src) hoặc là đường dẫn chuỗi
const imgUrl = (img: string | { src: string }) => (typeof img === 'string' ? img : img.src);

const buildDestinations = (): Destination[] => {
  const catId = (name: string) => CATEGORIES.find((c) => c.name === name)!.id;
  // Link nhúng Google Maps của web du khách chứa tọa độ: ...!2d<kinh độ>!3d<vĩ độ>...
  const coordsOf = (embedUrl: string) => {
    const m = /!2d(-?[\d.]+)!3d(-?[\d.]+)/.exec(embedUrl);
    return m ? { latitude: Number(Number(m[2]).toFixed(5)), longitude: Number(Number(m[1]).toFixed(5)) } : {};
  };
  const approved = placesData.map((p, i): Destination => {
    const c = coordsOf(p.mapUrl);
    return {
      id: p.id, name: p.name, description: p.infor, district: p.address, ticketPrice: p.priceDisplay, openHours: p.time, avgRating: p.stars,
      ...c,
      addressUrl: 'latitude' in c ? `https://www.google.com/maps?q=${c.latitude},${c.longitude}` : undefined,
      categoryId: catId(p.category), images: [imgUrl(p.img)], status: 'APPROVED', createdBy: 1, createdAt: ago((9 - i) * 4000)
    };
  });
  const quickImage = (name: string) => quickSearchPlacesData.find((q) => q.name === name)?.img;
  const proposals: Destination[] = [
    { id: 9, name: 'Mì Quảng Bà Mua', description: 'Món Mì Quảng chính gốc chuẩn vị Đà Thành thơm ngon đậm đà.', district: 'Hải Châu', ticketPrice: 'Từ 45.000 đ', openHours: '06:30 - 22:00', avgRating: 0, categoryId: catId('Ẩm thực'), images: [quickImage('Mì Quảng Bà Mua')].filter((x) => !!x).map((x) => imgUrl(x!)), status: 'PENDING', createdBy: 3, createdAt: ago(120) },
    { id: 10, name: 'Tiệm Cà Phê Rừng Dừa Cẩm Lệ', description: 'Quán cafe không gian xanh mát cạnh rừng dừa nước, view hoàng hôn cực chill.', district: 'Cẩm Lệ', ticketPrice: '25.000 - 55.000 đ', openHours: '07:00 - 22:30', avgRating: 0, categoryId: catId('Cafe & Check-in'), images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80'], status: 'PENDING', createdBy: 8, createdAt: ago(600) },
    { id: 11, name: 'Quán nhậu vỉa hè không tên', description: 'Không có địa chỉ cụ thể, ảnh lấy từ internet.', district: 'Thanh Khê', avgRating: 0, categoryId: catId('Ẩm thực'), status: 'REJECTED', createdBy: 9, createdAt: ago(9000) }
  ];
  return [...approved, ...proposals];
};

type StoredEvent = Omit<EventItem, 'startDate' | 'endDate' | 'ticketPrice' | 'images' | 'destination'> & { startDate: string; endDate: string; ticketPrice: number; images: string[] };
const buildEvents = (): StoredEvent[] => [
  { id: 1, name: 'Lễ hội Pháo hoa Quốc tế Đà Nẵng (DIFF)', description: 'Các đội pháo hoa quốc tế tranh tài trên sông Hàn vào tối thứ 7 hằng tuần.', destinationId: 8, locationNote: 'Khán đài hai bờ sông Hàn', startDate: dateOffset(-3), endDate: dateOffset(10), ticketPrice: 1200000, status: 'APPROVED', createdBy: 1, createdAt: ago(20000), images: [photo('photo-1498931299472-f7a63a5a1cfa')] },
  { id: 2, name: 'Tuần lễ Ẩm thực Biển Đà Nẵng', description: 'Hơn 100 gian hàng hải sản tươi sống và đặc sản miền Trung.', destinationId: 5, locationNote: 'Công viên Biển Đông, Q. Sơn Trà', startDate: dateOffset(8), endDate: dateOffset(14), ticketPrice: 0, status: 'APPROVED', createdBy: 1, createdAt: ago(9000), images: [photo('photo-1555396273-367ea4eb4db5')] },
  { id: 3, name: 'Lễ hội Quán Thế Âm Ngũ Hành Sơn', description: 'Lễ hội văn hóa tâm linh cấp quốc gia.', destinationId: 7, locationNote: null, startDate: dateOffset(150), endDate: dateOffset(152), ticketPrice: 0, status: 'APPROVED', createdBy: 2, createdAt: ago(5000), images: [photo('photo-1583417319070-4a69db38a482')] },
  { id: 4, name: 'Marathon Quốc tế Đà Nẵng', description: 'Chạy dọc biển Mỹ Khê.', destinationId: 3, locationNote: 'Xuất phát: Công viên Biển Đông', startDate: dateOffset(-70), endDate: dateOffset(-70), ticketPrice: 500000, status: 'APPROVED', createdBy: 1, createdAt: ago(120000), images: [photo('photo-1452626038306-9aae5e071dd3')] },
  { id: 5, name: 'Hội chợ Đặc sản Làng nghề Nam Ô', description: 'Giới thiệu nước mắm Nam Ô và các sản phẩm làng nghề ven biển.', destinationId: null, locationNote: 'Làng nghề Nam Ô, Q. Liên Chiểu', startDate: dateOffset(25), endDate: dateOffset(28), ticketPrice: 0, status: 'PENDING', createdBy: 2, createdAt: ago(200), images: [photo('photo-1519046904884-53103b34b206')] }
];

type StoredPost = { id: number; userId: number; destinationId: number | null; content: string; status: ContentStatus; createdAt: string; images: string[]; likes: number; comments: number };
// Cấu trúc bài đăng của web du khách có nhiều loại (trải nghiệm, hỏi đáp, địa điểm mới) nên khai báo lỏng
type WebPost = { user: { name: string }; content?: string; placeName?: string; category?: string; openTime?: string; closeTime?: string; priceFrom?: string; priceTo?: string; description?: string; location?: string; image?: string; images?: string[]; likes: number; commentsCount: number };
const userByName = (name: string) => USERS.find((u) => u.fullName === name)?.id ?? 3;
const POST_PLACE: Record<string, number> = { 'Cầu Rồng, Đà Nẵng': 8, 'Bãi biển Mỹ Khê, Đà Nẵng': 3 };
const buildPosts = (): StoredPost[] =>
  (initialPosts as WebPost[]).map((p, i) => ({
    id: i + 1,
    userId: userByName(p.user.name),
    destinationId: (p.location && POST_PLACE[p.location]) || null,
    content: p.content ?? `${p.placeName} (${p.category}, ${p.openTime} - ${p.closeTime}, ${p.priceFrom}-${p.priceTo}đ): ${p.description}`,
    status: i === 1 ? 'APPROVED' : 'PENDING',
    createdAt: ago([120, 1500, 45][i] ?? 60),
    images: p.images ?? (p.image ? [p.image] : []),
    likes: p.likes,
    comments: p.commentsCount
  }));

const buildReviews = (): Review[] => {
  const r = (id: number, userId: number, destinationId: number, rating: number, comment: string, status: ContentStatus, minutesAgo: number, imageUrl?: string): Review => ({ id, userId, destinationId, rating, comment, status, createdAt: ago(minutesAgo), images: imageUrl ? [photo(imageUrl)] : [] });
  return [
    // 3 đánh giá mẫu của web du khách (Nguyễn Văn A, Trần Thị B, Lê Hoàng C), gán vào Bà Nà Hills, Cầu Vàng, Bảo tàng Chăm
    ...sampleReviews.map((v, i) => r(i + 1, userByName(v.name), [1, 2, 6][i], Math.round(v.stars), v.comment, 'PENDING', [50, 190, 700][i], i === 0 ? 'photo-1590073844006-33379778ae09' : undefined)),
    r(4, 6, 8, 5, 'Xem cầu phun lửa tối thứ 7, rất đông nhưng đáng đi.', 'APPROVED', 2900, 'photo-1559592413-7cec4d0cae2b'),
    r(5, 7, 3, 4, 'Biển sạch, nước trong, buổi sáng đi dạo rất thích.', 'APPROVED', 4400, 'photo-1507525428034-b723cf961d3e'),
    r(6, 8, 5, 5, 'Đồ ăn đa dạng, giá hợp lý, nên đi vào buổi tối.', 'APPROVED', 20000),
    r(7, 3, 7, 4, 'Leo núi hơi mệt nhưng các hang động rất đẹp.', 'APPROVED', 41000),
    r(8, 9, 1, 1, 'Mua vé giá rẻ inbox zalo 09xxxxxxx', 'REJECTED', 15000)
  ];
};

// Lịch trình của du khách (cho trang Thống kê): ngày tạo cách đây, số ngày đi, ngân sách, các điểm đến
type Itinerary = { createdAt: string; tripDays: number; budget: number; destinationIds: number[] };
const buildItineraries = (): Itinerary[] =>
  [
    [170, 3, 6e6, [3, 8, 1]], [140, 2, 1.5e6, [5, 4]], [120, 5, 9e6, [3, 6, 7, 2]], [100, 2, 3e6, [8, 3]], [80, 3, 2.5e6, [5, 8]],
    [60, 5, 15e6, [1, 3, 7, 4]], [45, 1, 1.2e6, [1]], [20, 2, 1e6, [4, 7]], [6, 3, 4e6, [5, 3]], [2, 4, 8e6, [7, 6, 8]]
  ].map(([daysAgo, tripDays, budget, destinationIds]) => ({ createdAt: ago((daysAgo as number) * 1440), tripDays: tripDays as number, budget: budget as number, destinationIds: destinationIds as number[] }));

const FAVORITES: [number, number, number][] = [[3, 1, 30], [3, 3, 30], [4, 8, 20], [5, 4, 10], [6, 8, 8], [7, 3, 6], [8, 5, 4], [3, 8, 3], [4, 1, 2], [5, 7, 1]]; // [người dùng, điểm đến, ngày trước]

const seed = () => ({
  users: USERS.map((u) => ({ ...u })),
  categories: CATEGORIES.map((c) => ({ ...c })),
  destinations: buildDestinations(),
  events: buildEvents(),
  posts: buildPosts(),
  reviews: buildReviews(),
  itineraries: buildItineraries(),
  favorites: FAVORITES.map(([userId, destinationId, daysAgo]) => ({ userId, destinationId, createdAt: ago(daysAgo * 1440) }))
});

let db = seed();
const nextId = (list: { id: number }[]) => Math.max(0, ...list.map((x) => x.id)) + 1;

// ───────── Máy chủ giả ─────────
type Body = Record<string, any>;
type Query = Record<string, string | number | undefined>;
interface Ctx { body: Body; query: Query; me: MockUser | null }

const fail = (status: number, message: string): never => { throw new ApiError(status, message); };
const needAuth = (c: Ctx) => c.me ?? fail(401, 'Vui lòng cung cấp mã xác thực JWT Token trong Header Authorization.');
const needStaff = (c: Ctx) => { const me = needAuth(c); return me.role === 'USER' ? fail(403, 'Bạn không có quyền thực hiện thao tác này.') : me; };
const needAdmin = (c: Ctx) => { const me = needAuth(c); return me.role !== 'ADMIN' ? fail(403, 'Bạn không có quyền thực hiện thao tác này.') : me; };

const statusOf = (c: Ctx, fallback?: ContentStatus) => {
  const s = c.query.status === undefined ? fallback : String(c.query.status);
  if (s !== undefined && !CONTENT_STATUSES.includes(s as ContentStatus)) fail(400, 'Trạng thái không hợp lệ.');
  return s as ContentStatus | undefined;
};
const byId = <T extends { id: number }>(list: T[], id: string, label: string): T => list.find((x) => x.id === Number(id)) ?? fail(404, `Không tìm thấy ${label} với ID: ${id}`);

const toUser = ({ password: _password, ...u }: MockUser): User => u;
const toEvent = (e: StoredEvent): EventItem => {
  const d = e.destinationId ? db.destinations.find((x) => x.id === e.destinationId) : undefined;
  return { ...e, startDate: `${e.startDate}T00:00:00.000Z`, endDate: `${e.endDate}T00:00:00.000Z`, ticketPrice: String(e.ticketPrice), images: e.images.map((imageUrl, i) => ({ id: e.id * 100 + i, imageUrl })), destination: d ? { id: d.id, name: d.name, district: d.district } : null };
};
const toPost = (p: StoredPost): FeedPost => {
  const u = db.users.find((x) => x.id === p.userId)!;
  const { likes, comments, images, ...rest } = p;
  return { ...rest, images: images.map((imageUrl, i) => ({ id: p.id * 100 + i, imageUrl })), user: { id: u.id, username: u.username, fullName: u.fullName, avatarUrl: u.avatarUrl ?? null }, _count: { likes, comments } };
};
const toReview = (r: Review): Review => {
  const u = db.users.find((x) => x.id === r.userId);
  const d = db.destinations.find((x) => x.id === r.destinationId);
  return { ...r, user: u && { id: u.id, fullName: u.fullName, avatarUrl: u.avatarUrl }, destination: d && { id: d.id, name: d.name } };
};
const toCategory = (c: Omit<Category, 'destinationCount'>): Category => ({ ...c, destinationCount: db.destinations.filter((d) => d.categoryId === c.id).length });

// avg_rating của điểm đến = trung bình các đánh giá đã duyệt (giống backend)
const recalcRating = (destinationId: number) => {
  const d = db.destinations.find((x) => x.id === destinationId);
  const rs = db.reviews.filter((r) => r.destinationId === destinationId && r.status === 'APPROVED');
  if (d) d.avgRating = rs.length ? Math.round((rs.reduce((s, r) => s + r.rating, 0) / rs.length) * 10) / 10 : 0;
};

const DEST_FIELDS = ['name', 'description', 'district', 'latitude', 'longitude', 'addressUrl', 'categoryId', 'ticketPrice', 'openHours'] as const;
const pickDestination = (b: Body) => Object.fromEntries(DEST_FIELDS.filter((k) => b[k] !== undefined).map((k) => [k, b[k]]));
const eventFields = (b: Body) => ({ name: b.name, description: b.description ?? null, destinationId: b.destinationId ?? null, locationNote: b.locationNote ?? null, startDate: String(b.startDate).slice(0, 10), endDate: String(b.endDate).slice(0, 10), ticketPrice: Number(b.ticketPrice ?? 0) });

// Thống kê: giống backend (≤31 ngày chia theo tuần, còn lại theo tháng)
function trends(days: number): Trends {
  const now = Date.now();
  const since = now - days * DAY;
  const inRange = (iso: string) => Date.parse(iso) >= since;
  const its = db.itineraries.filter((i) => inRange(i.createdAt));
  const dests = its.flatMap((i) => i.destinationIds.map((id) => db.destinations.find((d) => d.id === id)!));
  const count = <K,>(keys: K[]) => keys.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map<K, number>());
  const byCat = count(dests.map((d) => d.categoryId));
  const byDistrict = count(dests.map((d) => d.district));
  const byDest = count(dests.map((d) => d.id));
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

  const weeks = Math.ceil(days / 7);
  const months = Math.max(1, Math.round(days / 30));
  const buckets = days <= 31
    ? Array.from({ length: weeks }, (_, i) => {
        const end = new Date(now - (weeks - 1 - i) * 7 * DAY);
        const start = new Date(end.getTime() - 6 * DAY);
        return { label: `${start.getDate()}/${start.getMonth() + 1}`, from: start.getTime(), to: end.getTime() + DAY - 1 };
      })
    : Array.from({ length: months }, (_, i) => {
        const d = new Date();
        const first = new Date(d.getFullYear(), d.getMonth() - (months - 1 - i), 1);
        return { label: `T${first.getMonth() + 1}`, from: first.getTime(), to: new Date(first.getFullYear(), first.getMonth() + 1, 1).getTime() - 1 };
      });

  return {
    days,
    itineraries: its.length,
    newUsers: db.users.filter((u) => u.role === 'USER' && inRange(u.createdAt)).length,
    reviews: db.reviews.filter((r) => inRange(r.createdAt)).length,
    avgTripDays: Math.round(avg(its.map((i) => i.tripDays)) * 10) / 10,
    avgBudget: Math.round(avg(its.map((i) => i.budget))),
    itineraryTrend: buckets.map((b) => ({ label: b.label, from: '', to: '', count: its.filter((i) => Date.parse(i.createdAt) >= b.from && Date.parse(i.createdAt) <= b.to).length })),
    categories: db.categories.map((c) => ({ id: c.id, name: c.name, iconUrl: c.iconUrl, count: byCat.get(c.id) ?? 0 })).sort((a, b) => b.count - a.count),
    districts: [...byDistrict.entries()].map(([name, n]) => ({ name, count: n })).sort((a, b) => b.count - a.count),
    topDestinations: [...byDest.entries()]
      .map(([id, inItineraries]) => {
        const d = db.destinations.find((x) => x.id === id)!;
        return {
          id, name: d.name, district: d.district, categoryName: db.categories.find((c) => c.id === d.categoryId)?.name, avgRating: d.avgRating, inItineraries,
          favorites: db.favorites.filter((f) => f.destinationId === id && inRange(f.createdAt)).length,
          reviews: db.reviews.filter((r) => r.destinationId === id && r.status === 'APPROVED' && inRange(r.createdAt)).length
        };
      })
      .sort((a, b) => b.inItineraries - a.inItineraries || b.favorites - a.favorites || b.avgRating - a.avgRating)
      .slice(0, 10)
  };
}

type Handler = (m: RegExpExecArray, c: Ctx) => unknown;
const ROUTES: [string, RegExp, Handler][] = [
  // identity
  ['POST', /^\/identity\/auth\/login$/, (_m, c) => {
    const key = String(c.body.emailOrUsername ?? '');
    const u = db.users.find((x) => x.email === key || x.username === key);
    if (!u || u.password !== c.body.password) fail(401, 'Email, tên đăng nhập hoặc mật khẩu không chính xác.');
    if (u!.status === 'LOCKED') fail(403, 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
    return { accessToken: `mock-${u!.id}`, user: toUser(u!) };
  }],
  ['GET', /^\/identity\/users$/, (_m, c) => { needAdmin(c); return [...db.users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(toUser); }],
  ['POST', /^\/identity\/users$/, (_m, c) => {
    needAdmin(c);
    const b = c.body;
    if (db.users.some((u) => u.email === b.email)) fail(409, `Người dùng với Email '${b.email}' đã tồn tại trong hệ thống.`);
    if (db.users.some((u) => u.username === b.username)) fail(409, `Người dùng với Tên đăng nhập '${b.username}' đã tồn tại trong hệ thống.`);
    const created: MockUser = { id: nextId(db.users), username: b.username, fullName: b.fullName, email: b.email, role: b.role, status: 'ACTIVE', createdAt: new Date().toISOString(), password: b.password };
    db.users.push(created);
    return toUser(created);
  }],
  ['PATCH', /^\/identity\/users\/(\d+)\/(status|role)$/, (m, c) => {
    const me = needAdmin(c);
    const target = byId(db.users, m[1], 'người dùng');
    if (target.id === me.id) fail(400, 'Không thể tự khóa hoặc tự đổi vai trò của chính mình.');
    if (m[2] === 'status') target.status = c.body.status; else target.role = c.body.role;
    return toUser(target);
  }],

  // destination
  ['GET', /^\/destinations$/, (_m, c) => db.destinations.filter((d) => d.status === statusOf(c, 'APPROVED')).sort((a, b) => b.createdAt.localeCompare(a.createdAt))],
  ['POST', /^\/destinations$/, (_m, c) => {
    const me = needAuth(c);
    const created = { id: nextId(db.destinations), avgRating: 0, status: 'PENDING', createdBy: me.id, createdAt: new Date().toISOString(), ...pickDestination(c.body) } as Destination;
    db.destinations.push(created);
    return created;
  }],
  ['PUT', /^\/destinations\/(\d+)$/, (m, c) => { needStaff(c); return Object.assign(byId(db.destinations, m[1], 'điểm đến'), pickDestination(c.body)); }],
  ['PATCH', /^\/destinations\/(\d+)\/status$/, (m, c) => { needStaff(c); return Object.assign(byId(db.destinations, m[1], 'điểm đến'), { status: c.body.status }); }],
  ['DELETE', /^\/destinations\/(\d+)$/, (m, c) => {
    needStaff(c);
    const d = byId(db.destinations, m[1], 'điểm đến');
    db.destinations = db.destinations.filter((x) => x !== d);
    return { message: `Đã xóa điểm đến ID ${d.id} thành công.` };
  }],

  // category
  ['GET', /^\/categories$/, () => db.categories.map(toCategory)],
  ['POST', /^\/categories$/, (_m, c) => {
    needStaff(c);
    const created = { id: nextId(db.categories), name: c.body.name, iconUrl: c.body.iconUrl };
    db.categories.push(created);
    return toCategory(created);
  }],
  ['PUT', /^\/categories\/(\d+)$/, (m, c) => { needStaff(c); return toCategory(Object.assign(byId(db.categories, m[1], 'danh mục'), { name: c.body.name, iconUrl: c.body.iconUrl })); }],
  ['DELETE', /^\/categories\/(\d+)$/, (m, c) => {
    needStaff(c);
    const cat = toCategory(byId(db.categories, m[1], 'danh mục'));
    if (cat.destinationCount > 0) fail(409, `Không thể xóa danh mục "${cat.name}" vì đang có ${cat.destinationCount} điểm đến thuộc danh mục này.`);
    db.categories = db.categories.filter((x) => x.id !== cat.id);
    return { message: `Đã xóa danh mục "${cat.name}".` };
  }],

  // event
  ['GET', /^\/events$/, (_m, c) => db.events.filter((e) => e.status === statusOf(c, 'APPROVED')).sort((a, b) => a.startDate.localeCompare(b.startDate)).map(toEvent)],
  ['POST', /^\/events$/, (_m, c) => {
    const me = needAuth(c);
    const created: StoredEvent = { id: nextId(db.events), status: 'PENDING', createdBy: me.id, createdAt: new Date().toISOString(), images: c.body.images ?? [], ...eventFields(c.body) };
    db.events.push(created);
    return toEvent(created);
  }],
  ['PUT', /^\/events\/(\d+)$/, (m, c) => { needStaff(c); return toEvent(Object.assign(byId(db.events, m[1], 'sự kiện'), eventFields(c.body))); }],
  ['PATCH', /^\/events\/(\d+)\/status$/, (m, c) => { needStaff(c); return toEvent(Object.assign(byId(db.events, m[1], 'sự kiện'), { status: c.body.status })); }],
  ['DELETE', /^\/events\/(\d+)$/, (m, c) => {
    needStaff(c);
    const e = byId(db.events, m[1], 'sự kiện');
    db.events = db.events.filter((x) => x !== e);
    return { message: `Đã xóa sự kiện ID ${e.id} thành công.` };
  }],

  // feed (bài đăng cộng đồng)
  ['GET', /^\/feed\/posts$/, (_m, c) => db.posts.filter((p) => p.status === statusOf(c, 'APPROVED')).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(toPost)],
  ['PATCH', /^\/feed\/posts\/(\d+)\/status$/, (m, c) => { needStaff(c); return toPost(Object.assign(byId(db.posts, m[1], 'bài đăng'), { status: c.body.status })); }],

  // đánh giá của du khách
  ['GET', /^\/community\/reviews\/manage$/, (_m, c) => {
    needStaff(c);
    const status = statusOf(c);
    return db.reviews.filter((r) => !status || r.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(toReview);
  }],
  ['PATCH', /^\/community\/reviews\/(\d+)\/status$/, (m, c) => {
    needStaff(c);
    const r = byId(db.reviews, m[1], 'đánh giá');
    r.status = c.body.status;
    recalcRating(r.destinationId);
    return toReview(r);
  }],

  // thống kê
  ['GET', /^\/statistics\/trends$/, (_m, c) => { needStaff(c); return trends(Math.min(Math.max(Number(c.query.days ?? 180), 7), 365)); }]
];

export async function mockRequest<T>(method: string, path: string, body?: unknown, query: Query = {}): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 120)); // giả lập độ trễ mạng để thấy trạng thái đang tải
  const token = tokenStorage.get();
  const meId = token?.startsWith('mock-') ? Number(token.slice(5)) : NaN;
  const ctx: Ctx = { body: (body ?? {}) as Body, query, me: db.users.find((u) => u.id === meId) ?? null };
  for (const [m, pattern, handler] of ROUTES) {
    const match = m === method ? pattern.exec(path) : null;
    if (match) return JSON.parse(JSON.stringify(handler(match, ctx) ?? null)) as T;
  }
  throw new ApiError(404, `Backend chưa có API này (${method} ${path}).`);
}
