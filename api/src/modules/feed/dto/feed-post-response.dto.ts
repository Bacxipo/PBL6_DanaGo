export class FeedPostResponseDto {
  id: number;
  userId: number;
  destinationId?: number;
  content: string;
  status: string;
  images: string[];
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  user?: {
    id: number;
    username: string;
    fullName: string;
    avatarUrl?: string;
  };
  createdAt: Date;
}
