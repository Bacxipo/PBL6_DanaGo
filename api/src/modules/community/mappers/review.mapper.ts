import { ReviewResponseDto } from '../dto/review-response.dto';

export class ReviewMapper {
  static toResponseDto(entity: any): ReviewResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      destinationId: entity.destinationId,
      rating: entity.rating,
      comment: entity.comment,
      status: entity.status,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      user: entity.user 
      ? {
         fullName: entity.user.fullName,
          avatarUrl: entity.user.avatarUrl,
      } 
      : undefined,
      images: entity.images
      ? entity.images.map((image: any) => ({
          id: image.id,
          imageUrl: image.imageUrl,
      }))
      : undefined,
    };
  }
}
