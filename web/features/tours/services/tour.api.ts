import { fetchApi } from '@/lib/api-client';

export interface Tour {
  id: string;
  title: string;
  price: number;
  location: string;
}

export async function getTours(): Promise<Tour[]> {
  return fetchApi<Tour[]>('/tours');
}
