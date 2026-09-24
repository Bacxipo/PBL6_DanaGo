export class EventResponseDto {
  id: number;
  name: string;
  description?: string;
  destinationId?: number;
  locationNote?: string;
  startDate: Date;
  endDate: Date;
  ticketPrice: number;
  status: string;
  createdBy?: number;
  createdAt: Date;
  images?: string[];
  isFavorited?: boolean;
  destination?: {
    id: number;
    name: string;
    district: string;
  };
}
