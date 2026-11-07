import type { RawDestination } from './destination-api';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export interface Favorite {
  destinationId: number;
  createdAt: string;
  destination: RawDestination;
}

export interface FavoriteStatus {
  isFavorited: boolean;
}

async function favoriteRequest<T>(endpoint: string, token: string, method = 'GET'): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/favorites${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(response.status === 401
      ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
      : method === 'GET'
        ? 'Không tải được danh sách yêu thích. Vui lòng thử lại.'
        : 'Không cập nhật được yêu thích. Vui lòng thử lại.');
  }
  return response.json();
}

export async function getMyFavorites(token: string): Promise<Favorite[]> {
  const data = await favoriteRequest<Favorite[]>('', token);
  if (!Array.isArray(data)) throw new Error('Dữ liệu yêu thích không hợp lệ.');
  return data;
}

export function addFavorite(destinationId: number, token: string): Promise<FavoriteStatus> {
  return favoriteRequest(`/${destinationId}`, token, 'POST');
}

export function removeFavorite(destinationId: number, token: string): Promise<FavoriteStatus> {
  return favoriteRequest(`/${destinationId}`, token, 'DELETE');
}
