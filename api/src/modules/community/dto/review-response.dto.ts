export class ReviewResponseDto {
  id: number;
  userId: number;
  destinationId: number;
  rating: number;
  comment?: string;
  status: string;
  createdAt: string;
}
