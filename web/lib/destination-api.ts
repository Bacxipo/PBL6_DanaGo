import { fetchApi } from './api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==================== INTERFACES ====================

export interface DestinationImage {
  id: number;
  imageUrl?: string;
  url?: string;
  isPrimary?: boolean;
}

export interface DestinationCategory {
  id: number;
  name: string;
}

export interface Destination {
  id: number;
  name: string;
  description?: string;
  district: string;
  ticketPrice?: string;
  avgRating: number;
  isFeatured?: boolean;
  category?: {
    id: number;
    name: string;
  };
  images?: Array<{
    id: number;
    url?: string;
    imageUrl?: string;
    isPrimary?: boolean;
  }>;
}

export interface RawDestination {
  id: number;
  name: string;
  description?: string;
  district: string;
  latitude?: number;
  longitude?: number;
  addressUrl?: string;
  categoryId?: number;
  categoryName?: string;
  ticketPrice?: string;
  openHours?: string;
  avgRating: number;
  status: string;
  createdBy?: number;
  createdAt?: string;
  images?: DestinationImage[];
}

export interface DestinationDetail {
  id: number;
  name: string;
  category: string;
  categoryType: string;
  district: string;
  address: string;
  des: string;
  infor: string;
  time: string;
  priceDisplay: string;
  move: string;
  mapUrl: string;
  avgRating: number;
  images: string[];
  img: string | null;
  latitude?: number;
  longitude?: number;
}

export interface DestinationCardItem {
  id: number;
  name: string;
  img: string | null;
  des: string;
  stars: number;
  reviews: string;
  category: string;
  categoryType: string;
  address: string;
  district: string;
  priceDisplay: string;
  time: string;
}

export interface GetDestinationsParams {
  status?: string;
  search?: string;
  categoryId?: number;
  district?: string;
}

// ==================== HELPER FUNCTIONS ====================

// Phân loại danh mục thành 'food' | 'sightseeing' | 'entertainment'
export const mapCategoryToType = (cat = ''): string => {
  const lower = cat.toLowerCase();
  if (lower.includes('ẩm thực') || lower.includes('ăn uống') || lower.includes('nhà hàng') || lower.includes('quán')) {
    return 'food';
  }
  if (lower.includes('giải trí') || lower.includes('vui chơi') || lower.includes('công viên')) {
    return 'entertainment';
  }
  return 'sightseeing';
};

// Chuẩn hóa đường dẫn Google Maps embed
export const formatMapEmbedUrl = (name = '', district = '', rawUrl = ''): string => {
  if (rawUrl && rawUrl.includes('embed')) {
    return rawUrl;
  }
  const searchQuery = [name, district, 'Đà Nẵng'].filter(Boolean).join(' ');
  return `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&output=embed`;
};

// Chuẩn hóa dữ liệu chi tiết một điểm đến (cho DetailPlace)
export const normalizeDestinationDetail = (data: any): DestinationDetail => {
  let imagesList: string[] = [];

  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    imagesList = data.images
      .map((img: any) => {
        if (typeof img === 'string') return img;
        return img?.imageUrl || img?.url || null;
      })
      .filter(Boolean);
  } else if (data.img) {
    imagesList = [typeof data.img === 'string' ? data.img : data.img?.src].filter(Boolean);
  }

  const categoryName = data.categoryName || data.category?.name || 'Địa điểm du lịch';
  const districtName = data.district ? `${data.district}, Đà Nẵng` : 'Đà Nẵng';
  const embedMap = formatMapEmbedUrl(data.name, data.district, data.addressUrl);

  return {
    id: data.id,
    name: data.name,
    category: categoryName,
    categoryType: mapCategoryToType(categoryName),
    district: data.district || '',
    address: districtName,
    des: data.description || 'Điểm đến hấp dẫn tại Đà Nẵng.',
    infor: data.description || 'Chưa có thông tin chi tiết bổ sung.',
    time: data.openHours || '08:00 - 18:00',
    priceDisplay: data.ticketPrice || 'Miễn phí',
    move: 'Xe máy, ô tô, taxi',
    mapUrl: embedMap,
    avgRating: data.avgRating ? Number(data.avgRating) : 4.8,
    images: imagesList,
    img: imagesList[0] || null,
    latitude: data.latitude ? Number(data.latitude) : undefined,
    longitude: data.longitude ? Number(data.longitude) : undefined,
  };
};

// Chuẩn hóa một điểm đến sang định dạng thẻ (cho Explore / PlaceCard)
export const normalizeDestinationCard = (item: any): DestinationCardItem => {
  const hasImg = item.images && item.images.length > 0 && (item.images[0]?.imageUrl || item.images[0]?.url);
  const imgUrl = hasImg ? (item.images[0].imageUrl || item.images[0].url) : item.img || null;
  const categoryName = item.categoryName || item.category?.name || 'Khám phá';

  return {
    id: item.id,
    name: item.name,
    img: imgUrl,
    des: item.description || 'Điểm đến hấp dẫn tại Đà Nẵng và miền Trung.',
    stars: item.avgRating ? Number(item.avgRating) : 4.5,
    reviews: '100+',
    category: categoryName,
    categoryType: mapCategoryToType(categoryName),
    address: item.district ? `${item.district}, Đà Nẵng` : 'Đà Nẵng',
    district: item.district || '',
    priceDisplay: item.ticketPrice || 'Miễn phí',
    time: item.openHours || '08:00 - 18:00',
  };
};

// ==================== API FUNCTIONS ====================

// 1. Lấy danh sách địa điểm nổi bật (từ develop)
export async function getFeaturedDestinations(limit = 4): Promise<Destination[]> {
  try {
    return await fetchApi<Destination[]>(`/destinations/featured?limit=${limit}`);
  } catch (error) {
    console.error('Lỗi khi tải địa điểm nổi bật:', error);
    return [];
  }
}

// 2. Lấy danh sách điểm đến đã chuẩn hóa theo thẻ (cho Explore / Catalog)
export async function getDestinations(params?: GetDestinationsParams): Promise<DestinationCardItem[]> {
  const query = new URLSearchParams();
  query.set('status', params?.status || 'APPROVED');
  if (params?.search) query.set('search', params.search);
  if (params?.categoryId) query.set('categoryId', String(params.categoryId));
  if (params?.district && params.district !== 'Tất cả quận') query.set('district', params.district);

  const res = await fetch(`${API_BASE_URL}/destinations?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Lỗi tải danh sách điểm đến (Mã lỗi: ${res.status})`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeDestinationCard) : [];
}

// 3. Lấy danh sách thô trực tiếp từ API
export async function getRawDestinations(params?: GetDestinationsParams): Promise<RawDestination[]> {
  const query = new URLSearchParams();
  query.set('status', params?.status || 'APPROVED');
  if (params?.search) query.set('search', params.search);
  if (params?.categoryId) query.set('categoryId', String(params.categoryId));
  if (params?.district && params.district !== 'Tất cả quận') query.set('district', params.district);

  const res = await fetch(`${API_BASE_URL}/destinations?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Lỗi tải danh sách điểm đến: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// 4. Lấy chi tiết một điểm đến theo ID
export async function getDestinationById(id: number | string): Promise<DestinationDetail> {
  const res = await fetch(`${API_BASE_URL}/destinations/${id}`);
  if (!res.ok) {
    throw new Error(`Không tìm thấy điểm đến (Mã lỗi: ${res.status})`);
  }
  const data = await res.json();
  return normalizeDestinationDetail(data);
}

// 5. Lấy danh sách danh mục điểm đến
export async function getDestinationCategories(): Promise<DestinationCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/destinations/categories`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Lỗi lấy danh mục điểm đến:', err);
    return [];
  }
}
