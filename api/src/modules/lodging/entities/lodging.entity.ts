export class LodgingImageEntity {
  id: number;
  lodgingId: number;
  imageUrl: string;
  createdAt: Date;
}

export class AmenityEntity {
  id: number;
  code: string;
  nameVi: string;
  category: string;
}

export class LodgingEntity {
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  createdAt: Date;
  addressUrl?: string;
  website?: string;
  images?: LodgingImageEntity[];
  amenities?: string[];
  amenityIds?: number[];
}
