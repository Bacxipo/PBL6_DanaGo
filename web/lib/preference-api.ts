import { apiRequest } from './feed-api';

export interface UserPreferences { categoryIds: number[] }

export function getMyPreferences(token: string): Promise<UserPreferences> {
  return apiRequest('/identity/users/me/preferences', { token });
}

export function saveMyPreferences(categoryIds: number[], token: string): Promise<UserPreferences> {
  return apiRequest('/identity/users/me/preferences', { method: 'PATCH', token, body: { categoryIds } });
}

export async function getPostLoginPath(token: string): Promise<string> {
  const preferences = await getMyPreferences(token);
  return preferences.categoryIds.length ? '/' : '/interests';
}
