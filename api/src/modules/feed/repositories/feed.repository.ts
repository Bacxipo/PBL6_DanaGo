import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateFeedPostDto, CreateFeedCommentDto } from '../dto/create-feed-post.dto';
import { ContentStatus, FeedPostType } from '@prisma/client';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

function timeToMinutes(value?: string): number | null {
  const match = value?.trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;

  return Number(match[1]) * 60 + Number(match[2]);
}

@Injectable()
export class FeedRepository {
  constructor(private readonly prisma: PrismaService) { }

  async categoryExists(id: number): Promise<boolean> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });

    return category !== null;
  }

  async createPost(userId: number, dto: CreateFeedPostDto, coordinates: { latitude: number; longitude: number } | null = null,) {
    return this.prisma.$transaction(async (tx) => {
      let destinationId = dto.destinationId;
      if (dto.postType === FeedPostType.NEW_DESTINATION) {
        if (!dto.proposal) throw new BadRequestException('Missing destination information.');
        const input = dto.proposal;
        const [opening, closing] = (input.openHours ?? '').split(' - ');
        const destination = await tx.destination.create({
          data: {
            name: input.name.trim(),
            description: input.description?.trim(),
            district: input.district.trim(),
            categoryId: input.categoryId,
            addressUrl: input.addressUrl,
            latitude: coordinates?.latitude,
            longitude: coordinates?.longitude,
            ticketPrice: input.ticketPrice,
            openHours: input.openHours,
            openTime: timeToMinutes(opening),
            closeTime: timeToMinutes(closing),
            status: ContentStatus.PENDING,
            createdBy: userId,
            images: { create: (dto.images ?? []).map((imageUrl) => ({ imageUrl, uploadedBy: userId })) },
          },
        });
        destinationId = destination.id;
      }
      return tx.feedPost.create({
        data: {
          userId,
          content: dto.content.trim(),
          destinationId,
          postType: dto.postType ?? FeedPostType.NORMAL,
          status: ContentStatus.PENDING,
          images: { create: (dto.images ?? []).map((imageUrl) => ({ imageUrl })) },
        },
        include: {
          images: true,
          user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
          destination: { include: { category: true } },
          _count: { select: { likes: true, comments: true } },
        },
      });
    });
  }

  async moderatePost(id: number, status: ContentStatus) {
    if (
      status !== ContentStatus.APPROVED &&
      status !== ContentStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Chỉ được duyệt hoặc từ chối bài viết.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const post = await tx.feedPost.findUnique({
        where: { id },
        include: {
          images: true,
          destination: true,
        },
      });

      if (!post) {
        throw new NotFoundException('Không tìm thấy bài viết.');
      }

      // Gọi lại cùng trạng thái không tạo thêm địa điểm.
      if (post.status === status) {
        return post;
      }

      if (post.status !== ContentStatus.PENDING) {
        throw new ConflictException(
          'Bài viết đã được xử lý.',
        );
      }

      const isNewDestination =
        post.postType === FeedPostType.NEW_DESTINATION;

      if (isNewDestination && post.destinationId === null) {
        throw new BadRequestException('Post has no linked destination.');
      }

      // Chỉ một transaction được chuyển bài khỏi PENDING.
      const claimed = await tx.feedPost.updateMany({
        where: {
          id,
          status: ContentStatus.PENDING,
        },
        data: { status },
      });

      if (claimed.count !== 1) {
        throw new ConflictException(
          'Bài viết vừa được người khác xử lý. Vui lòng tải lại.',
        );
      }

      if (isNewDestination) {
        await tx.destination.update({
          where: { id: post.destinationId! },
          data: { status },
        });
      }

      return tx.feedPost.findUniqueOrThrow({
        where: { id },
        include: {
          images: true,
          destination: true,
        },
      });
    });
  }

  async findAllPosts(status?: ContentStatus, currentUserId?: number, authorId?: number) {
    const posts = await this.prisma.feedPost.findMany({
      where: {
        status: authorId === undefined ? (status ?? ContentStatus.APPROVED) : status,
        userId: authorId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        destination: { include: { category: true } },
        likes: currentUserId ? { where: { userId: currentUserId } } : false,
        _count: { select: { likes: true, comments: true } },
      },
    });

    return posts.map((post) => ({
      ...post,
      isLiked: currentUserId ? post.likes && post.likes.length > 0 : false,
    }));
  }

  async findPostById(id: number) {
    return this.prisma.feedPost.findUnique({
      where: { id },
      include: {
        images: true,
        user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        destination: { include: { category: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  async updatePostStatus(id: number, status: ContentStatus) {
    return this.prisma.feedPost.update({
      where: { id },
      data: { status },
    });
  }

  async toggleLike(postId: number, userId: number) {
    const existingLike = await this.prisma.feedLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existingLike) {
      await this.prisma.feedLike.delete({
        where: { postId_userId: { postId, userId } },
      });
      return { liked: false };
    } else {
      await this.prisma.feedLike.create({
        data: { postId, userId },
      });
      return { liked: true };
    }
  }

  async addComment(postId: number, userId: number, dto: CreateFeedCommentDto) {
    return this.prisma.feedComment.create({
      data: {
        postId,
        userId,
        content: dto.content,
      },
      include: {
        user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      },
    });
  }

  async getCommentsByPostId(postId: number) {
    return this.prisma.feedComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
      },
    });
  }
  async deletePost(id: number) {
    return this.prisma.feedPost.delete({
      where: { id },
    });
  }

  async updatePostContent(postId: number, content: string) {
    await this.prisma.feedPost.update({
      where: { id: postId },
      data: { content },
    });

    return this.findPostById(postId);
  }
}
