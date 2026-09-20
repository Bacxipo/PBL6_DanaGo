export class DestinationEntity {
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdBy?: number;
  createdAt: Date;
}
