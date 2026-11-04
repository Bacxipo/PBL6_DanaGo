export class DestinationImageEntity {
  id: number;
  destinationId: number;
  imageUrl: string;
  uploadedBy?: number;
  createdAt: Date;
}

export class DestinationEntity {
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdBy?: number;
  createdAt: Date;
  images?: DestinationImageEntity[];
}
