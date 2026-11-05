import { fetchApi } from './api-client';

export interface Destination {
  id: number;
  name: string;
  description?: string;
  district: string;
  ticketPrice?: string;
  avgRating: number;
  isFeatured: boolean;
  category?: {
    id: number;
    name: string;
  };
  images?: Array<{
    id: number;
    url: string;
    isPrimary?: boolean;
  }>;
}
export async function getFeaturedDestinations(limit = 4): Promise<Destination[]> {
  try {
    return await fetchApi<Destination[]>(`/destinations/featured?limit=${limit}`);
  } catch (error) {
    console.error('Lỗi khi tải địa điểm nổi bật:', error);
    return [];
  }
}