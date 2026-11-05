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

