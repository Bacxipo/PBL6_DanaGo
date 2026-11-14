// Khớp kiểu `Trends` mà WebAdmin dùng (WebAdmin/src/lib/types.ts)
export class TrendBucketDto {
  label: string;
  from: string;
  to: string;
  count: number;
}

export class TrendCategoryDto {
  id: number;
  name: string;
  iconUrl?: string;
  count: number;
}

export class TrendDistrictDto {
  name: string;
  count: number;
}

export class TopDestinationDto {
  id: number;
  name: string;
  district: string;
  categoryName?: string;
  avgRating: number;
  inItineraries: number;
  favorites: number;
  reviews: number;
}

export class TrendsResponseDto {
  days: number;
  itineraries: number;
  newUsers: number;
  reviews: number;
  avgTripDays: number;
  avgBudget: number;
  itineraryTrend: TrendBucketDto[];
  categories: TrendCategoryDto[];
  districts: TrendDistrictDto[];
  topDestinations: TopDestinationDto[];
}
