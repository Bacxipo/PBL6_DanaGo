export class LodgingImageDto {
  id: number;
  imageUrl: string;
}

export class AmenityResponseDto {
  id: number;
  code: string;
  nameVi: string;
  category: string;
}

export class LodgingResponseDto {
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
  createdAt: Date;
  addressUrl?: string;
  website?: string;
  images?: LodgingImageDto[];
  amenities?: string[];
  amenityIds?: number[];
}
