const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface LodgingImage {
  id: number;
  imageUrl: string;
}

export interface AmenityItem {
  id: number;
  code: string;
  nameVi: string;
  category: string;
}

export interface LodgingItem {
  id: number;
  name: string;
  type: string;
  district?: string;
  region?: string;
  latitude: number;
  longitude: number;
  pricePerNight: number;
  pricePpNight: number;
  maxGuests: number;
  checkin: string;
  checkout: string;
  avgRating: number;
  description?: string;
  status: string;
  addressUrl?: string;
  website?: string;
  images?: LodgingImage[];
  amenities?: string[];
  amenityIds?: number[];
}

export interface GetLodgingsFilter {
  status?: string;
  search?: string;
  type?: string;
  district?: string;
  region?: string;
  guests?: number;
  amenities?: string[];
}

export async function getLodgings(filters: GetLodgingsFilter = {}): Promise<LodgingItem[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.search?.trim()) params.set('search', filters.search.trim());
  if (filters.type && filters.type !== 'ALL') params.set('type', filters.type);
  if (filters.district && filters.district !== 'ALL') params.set('district', filters.district);
  if (filters.region && filters.region !== 'ALL') params.set('region', filters.region);
  if (filters.guests && filters.guests > 0) params.set('guests', String(filters.guests));
  if (filters.amenities && filters.amenities.length > 0) {
    params.set('amenities', filters.amenities.join(','));
  }

  const qs = params.toString();
  const res = await fetch(`${API_BASE_URL}/lodgings${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Không thể tải danh sách nơi lưu trú (${res.status})`);
  }
  return res.json();
}

export async function getLodgingAmenities(): Promise<AmenityItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/lodgings/amenities`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
