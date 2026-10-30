import { BadRequestException, Injectable, ForbiddenException, } from '@nestjs/common';
import { FeedRepository } from '../repositories/feed.repository';
import { CreateFeedPostDto, CreateFeedCommentDto } from '../dto/create-feed-post.dto';
import { FeedPostNotFoundException } from '../exceptions/feed-post-not-found.exception';
import { ContentStatus, FeedPostType } from '@prisma/client';

import { DestinationService } from '../../destination/services/destination.service';

function extractCoordinates(url: string) {
  const match = url.match(
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  );

  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);

  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return null;
  }

  return { latitude, longitude };
}


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
  async getAllPosts(status?: ContentStatus, currentUserId?: number) {
    return this.feedRepository.findAllPosts(status || ContentStatus.APPROVED, currentUserId);
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
    await this.getPostById(postId);
    return this.feedRepository.toggleLike(postId, userId);
  }

  async addComment(postId: number, userId: number, dto: CreateFeedCommentDto) {
    await this.getPostById(postId);
    return this.feedRepository.addComment(postId, userId, dto);
  }

  async getComments(postId: number) {
    await this.getPostById(postId);
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
}
