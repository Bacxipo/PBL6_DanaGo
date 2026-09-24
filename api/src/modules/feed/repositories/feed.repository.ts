import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateFeedPostDto, CreateFeedCommentDto } from '../dto/create-feed-post.dto';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class FeedRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(userId: number, dto: CreateFeedPostDto) {
    return this.prisma.feedPost.create({
      data: {
        userId,
        destinationId: dto.destinationId,
        content: dto.content,
        status: ContentStatus.PENDING,
        images: dto.images && dto.images.length > 0
          ? {
              create: dto.images.map((url) => ({ imageUrl: url })),
            }
          : undefined,
      },
      include: {
        images: true,
        user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  async findAllPosts(status: ContentStatus = ContentStatus.APPROVED, currentUserId?: number) {
    const posts = await this.prisma.feedPost.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        user: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
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
}
