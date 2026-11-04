export class EventEntity {
  id: number;
  name: string;
  description?: string;
  destinationId?: number;
  locationNote?: string;
  startDate: Date;
  endDate: Date;
  ticketPrice?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdBy?: number;
  createdAt: Date;
}
