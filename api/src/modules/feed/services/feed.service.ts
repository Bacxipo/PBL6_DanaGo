import { BadRequestException, Injectable, ForbiddenException, } from '@nestjs/common';
import { FeedRepository } from '../repositories/feed.repository';
import { CreateFeedPostDto, CreateFeedCommentDto } from '../dto/create-feed-post.dto';
import { FeedPostNotFoundException } from '../exceptions/feed-post-not-found.exception';
import { ContentStatus, FeedPostType, UserRole } from '@prisma/client';
import { UpdateFeedPostDto } from '../dto/update-feed-post.dto';
import { DestinationService } from '../../destination/services/destination.service';
import { extractCoordinates } from '../../../shared/utils/map.utils';

@Injectable()
export class FeedService {
  constructor(
    private readonly feedRepository: FeedRepository,

    private readonly destinationService: DestinationService
  ) { }

  async createPost(userId: number, dto: CreateFeedPostDto) {
    if (!dto.content.trim()) {
      throw new BadRequestException(
        'Nội dung bài viết không được để trống.',
      );
    }

    if (dto.images && dto.images.length > 5) {
      throw new BadRequestException(
        'Chỉ được đăng tối đa 5 ảnh.',
      );
    }

    const isNewDestination =
      dto.postType === FeedPostType.NEW_DESTINATION;

    if (isNewDestination) {
      if (!dto.proposal) {
        throw new BadRequestException(
          'Vui lòng cung cấp thông tin địa điểm đề xuất.',
        );
      }

      if (dto.destinationId != null) {
        throw new BadRequestException(
          'Đề xuất mới không được gắn với địa điểm có sẵn.',
        );
      }

      if (
        !dto.proposal.name.trim() ||
        !dto.proposal.district.trim()
      ) {
        throw new BadRequestException(
          'Tên địa điểm và quận/huyện không được để trống.',
        );
      }

      if (!dto.images?.length) {
        throw new BadRequestException(
          'Vui lòng cung cấp ít nhất một ảnh thực tế.',
        );
      }

      if (dto.proposal.categoryId != null) {
        const exists = await this.feedRepository.categoryExists(
          dto.proposal.categoryId,
        );

        if (!exists) {
          throw new BadRequestException(
            'Danh mục không tồn tại.',
          );
        }
      }
    } else {
      if (dto.proposal != null) {
        throw new BadRequestException(
          'Chỉ bài NEW_DESTINATION được gửi thông tin đề xuất.',
        );
      }

      if (dto.destinationId != null) {
        await this.destinationService.getDestinationById(
          dto.destinationId,
        );
      }
    }
    const coordinates = dto.proposal?.addressUrl
      ? extractCoordinates(dto.proposal.addressUrl)
      : null;
    return this.feedRepository.createPost(userId, dto, coordinates);
  }
  async getAllPosts(
    status?: ContentStatus,
    currentUserId?: number,
    role?: UserRole,
  ) {
    const canModerate =
      role === UserRole.ADMIN ||
      role === UserRole.STAFF;

    if (
      status !== undefined &&
      !Object.values(ContentStatus).includes(status)
    ) {
      throw new BadRequestException('Trạng thái không hợp lệ.');
    }

    if (
      status !== undefined &&
      status !== ContentStatus.APPROVED &&
      !canModerate
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền xem danh sách bài chưa công khai.',
      );
    }

    return this.feedRepository.findAllPosts(
      status ?? ContentStatus.APPROVED,
      currentUserId,
    );
  }

  async getMyPosts(userId: number) {
    return this.feedRepository.findAllPosts(undefined, userId, userId);
  }

  async getPostById(id: number) {
    const post = await this.feedRepository.findPostById(id);
    if (!post) {
      throw new FeedPostNotFoundException(id);
    }
    return post;
  }

  async updatePostStatus(id: number, status: ContentStatus) {
    return this.feedRepository.moderatePost(id, status);
  }
  async toggleLike(postId: number, userId: number) {
    await this.getApprovedPost(postId);
    return this.feedRepository.toggleLike(postId, userId);
  }

  async addComment(postId: number, userId: number, dto: CreateFeedCommentDto) {
    await this.getApprovedPost(postId);
    const content = dto.content.trim();
    if (!content) {
      throw new BadRequestException(
        'Bình luận không được để trống.',
      );
    }
    return this.feedRepository.addComment(postId, userId, { content });
  }

  async getComments(postId: number) {
    await this.getApprovedPost(postId);
    return this.feedRepository.getCommentsByPostId(postId);
  }
  async deletePost(id: number, userId: number) {
    const post = await this.getPostById(id);

    if (post.userId !== userId) {
      throw new ForbiddenException(
        'Bạn chỉ có thể xóa bài viết của chính mình.',
      );
    }

    await this.feedRepository.deletePost(id);

    return {
      message: 'Xóa bài viết thành công.',
      id,
    };
  }

  async updatePost(
    postId: number,
    userId: number,
    dto: UpdateFeedPostDto,
  ) {
    const post = await this.getPostById(postId);

    if (post.userId !== userId) {
      throw new ForbiddenException(
        'Bạn chỉ có thể chỉnh sửa bài viết của mình.',
      );
    }

    return this.feedRepository.updatePostContent(
      postId,
      dto.content.trim(),
    );
  }

  async getVisiblePostById(
    id: number,
    currentUserId?: number,
    role?: UserRole,
  ) {
    const post = await this.getPostById(id);

    const canModerate =
      role === UserRole.ADMIN ||
      role === UserRole.STAFF;

    const canView =
      post.status === ContentStatus.APPROVED ||
      post.userId === currentUserId ||
      canModerate;

    if (!canView) {
      throw new FeedPostNotFoundException(id);
    }

    return post;
  }

  private async getApprovedPost(postId: number) {
    const post = await this.getPostById(postId);

    if (post.status !== ContentStatus.APPROVED) {
      throw new FeedPostNotFoundException(postId);
    }

    return post;
  }
}
