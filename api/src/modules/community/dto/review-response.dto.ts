export class ReviewUserDto{
  fullName: string;
  avatarUrl?: string;
}
export class ReviewImageDto{
  id: number;
  imageUrl: string;
}
export class ReviewResponseDto{
  id: number;
  userId: number;
  destinationId: number;
  rating: number;
  comment?: string;
  status: string;
  createdAt: Date;

  user?: ReviewUserDto;
  images?: ReviewImageDto[];
}