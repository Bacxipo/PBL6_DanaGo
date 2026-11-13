export class ReviewEntity {
  id: number;
  userId: number;
  destinationId: number;
  rating: number;
  comment?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}
