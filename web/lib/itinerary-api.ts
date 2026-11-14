import { fetchApi } from './api-client';

export interface ChecklistItemData {
  id?: number | string;
  itineraryItemId?: number;
  itemName: string;
  isChecked: boolean;
  activityId?: number | string;
  activityName?: string;
  dayIndex?: number;
}

export function getCurrentUserId(): number | null {
  if (typeof window === 'undefined') return null;
  const token = sessionStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(atob(parts[1]));
      return payload.sub ? Number(payload.sub) : null;
    }
  } catch (e) {
    console.warn('Không thể giải mã access token:', e);
  }
  return null;
}

// Khóa localStorage lưu lịch trình theo từng tài khoản (chưa đăng nhập -> 'guest')
// để các tài khoản dùng chung một trình duyệt không thấy lịch trình của nhau.
export function getItinerariesStorageKey(): string {
  const userId = getCurrentUserId();
  return `danago_itineraries:${userId ?? 'guest'}`;
}

export async function saveItineraryFull(itineraryData: any) {
  try {
    return await fetchApi('/itineraries/save-full', {
      method: 'POST',
      body: JSON.stringify(itineraryData),
    });
  } catch (err) {
    console.warn('Lưu vào API backend thất bại (sử dụng local fallback):', err);
    return null;
  }
}

export async function fetchItinerariesByUser(userId: number | string) {
  try {
    return await fetchApi<any[]>(`/itineraries/user/${userId}`);
  } catch (err) {
    console.warn(`Lấy danh sách lịch trình của user #${userId} thất bại:`, err);
    return [];
  }
}

export async function deleteItineraryApi(id: number | string) {
  try {
    return await fetchApi(`/itineraries/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn(`Xóa lịch trình #${id} thất bại:`, err);
    return null;
  }
}

export async function fetchItineraryById(id: number | string) {
  try {
    return await fetchApi(`/itineraries/${id}`);
  } catch (err) {
    console.warn(`Lấy dữ liệu lịch trình #${id} thất bại:`, err);
    return null;
  }
}

export async function fetchChecklistsByItinerary(itineraryId: number | string) {
  try {
    return await fetchApi<ChecklistItemData[]>(`/itineraries/${itineraryId}/checklists`);
  } catch (err) {
    console.warn(`Lấy checklist cho lịch trình #${itineraryId} thất bại:`, err);
    return [];
  }
}

export async function createChecklistItemApi(itemId: number, itemName: string, isChecked = false) {
  try {
    return await fetchApi(`/itineraries/items/${itemId}/checklists`, {
      method: 'POST',
      body: JSON.stringify({ itemName, isChecked }),
    });
  } catch (err) {
    console.warn('Tạo checklist item trên backend thất bại:', err);
    return null;
  }
}

export async function updateChecklistItemApi(id: number, data: { isChecked?: boolean; itemName?: string }) {
  try {
    return await fetchApi(`/itineraries/checklists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn(`Cập nhật checklist item #${id} thất bại:`, err);
    return null;
  }
}

export async function deleteChecklistItemApi(id: number) {
  try {
    return await fetchApi(`/itineraries/checklists/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn(`Xóa checklist item #${id} thất bại:`, err);
    return null;
  }
}

