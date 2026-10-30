export class DestinationImageDto {
  id: number;
  imageUrl: string;
}

export class DestinationResponseDto {
  id: number;
  name: string;
  description?: string;
  district: string;
  latitude?: number;
  longitude?: number;
  addressUrl?: string;
  categoryId?: number;
  categoryName?: string;
  ticketPrice?: string;
  openHours?: string;
  avgRating: number;
  status: string;
  createdBy?: number;
  createdAt: Date;
  images?: DestinationImageDto[];
}
