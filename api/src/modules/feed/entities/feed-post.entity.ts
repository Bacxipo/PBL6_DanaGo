export class FeedPostEntity {
  id: number;
  userId: number;
  destinationId?: number;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

export class FeedCommentEntity {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: Date;
}

export class FeedLikeEntity {
  postId: number;
  userId: number;
  createdAt: Date;
}
