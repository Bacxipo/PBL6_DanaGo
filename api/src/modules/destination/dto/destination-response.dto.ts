export class DestinationResponseDto {
  id: number;
  name: string;
  description?: string;
  district: string;
  latitude?: number;
  longitude?: number;
  addressUrl?: string;
  categoryId?: number;
  ticketPrice?: string;
  openHours?: string;
  avgRating: number;
  status: string;
  createdBy?: number;
  createdAt: Date;
}
