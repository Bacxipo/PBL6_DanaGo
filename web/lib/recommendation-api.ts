import { getMyPreferences } from './preference-api';
import { getRawDestinations, normalizeDestinationCard } from './destination-api';
import type { DestinationCardItem, RawDestination } from './destination-api';

export async function getRecommendedDestinations(token: string): Promise<DestinationCardItem[]> {
  const { categoryIds } = await getMyPreferences(token);
  const categories = [...new Set(categoryIds)];
  if (!categories.length) return [];

  const groups = await Promise.all(categories.map((categoryId) =>
    getRawDestinations({ categoryId, status: 'APPROVED' })));
  groups.forEach((items) => items.sort((a, b) => Number(b.avgRating) - Number(a.avgRating) || a.id - b.id));

  // Alternate categories so a single interest does not fill every suggestion.
  const selected: RawDestination[] = [];
  const seen = new Set<number>();
  const maxLength = Math.max(0, ...groups.map((items) => items.length));
  for (let index = 0; index < maxLength && selected.length < 4; index++) {
    for (const items of groups) {
      const item = items[index];
      if (item && item.status === 'APPROVED' && categories.includes(item.categoryId!) && !seen.has(item.id)) {
        selected.push(item);
        seen.add(item.id);
      }
      if (selected.length === 4) break;
    }
  }
  return selected.map(normalizeDestinationCard);
}
