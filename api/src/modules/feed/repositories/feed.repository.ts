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
    return this.prisma.feedPost.create({
      data: {
        userId,
        content: dto.content.trim(),
        destinationId: dto.destinationId,
        postType: dto.postType ?? FeedPostType.NORMAL,
        status: ContentStatus.PENDING,

        images: dto.images?.length
          ? {
            create: dto.images.map((imageUrl) => ({
              imageUrl,
            })),
          }
          : undefined,

        proposal: dto.proposal
          ? {
            create: {
              name: dto.proposal.name.trim(),
              description: dto.proposal.description?.trim(),
              district: dto.proposal.district.trim(),
              categoryId: dto.proposal.categoryId,
              addressUrl: dto.proposal.addressUrl,
              latitude: coordinates?.latitude,
              longitude: coordinates?.longitude,
              ticketPrice: dto.proposal.ticketPrice,
              openHours: dto.proposal.openHours,
            },
          }
          : undefined,
      },

      include: {
        proposal: true,
        images: true,
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        destination: {
          select: {
            id: true,
            name: true,
            district: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
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
          proposal: true,
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

      if (
        status === ContentStatus.APPROVED &&
        isNewDestination
      ) {
        if (!post.proposal) {
          throw new BadRequestException(
            'Bài viết chưa có thông tin đề xuất.',
          );
        }

        if (post.destinationId !== null) {
          throw new ConflictException(
            'Bài đề xuất đã có địa điểm liên kết.',
          );
        }

        if (post.images.length === 0) {
          throw new BadRequestException(
            'Đề xuất phải có ít nhất một ảnh.',
          );
        }
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

      if (
        status === ContentStatus.APPROVED &&
        isNewDestination
      ) {
        const proposal = post.proposal!;
        const [opening, closing] = (proposal.openHours ?? '').split(' - ');
        const destination = await tx.destination.create({
          data: {
            name: proposal.name,
            description: proposal.description,
            district: proposal.district,
            categoryId: proposal.categoryId,
            addressUrl: proposal.addressUrl,
            latitude: proposal.latitude,
            longitude: proposal.longitude,
            ticketPrice: proposal.ticketPrice,
            openHours: proposal.openHours,
            openTime: timeToMinutes(opening),
            closeTime: timeToMinutes(closing),
            status: ContentStatus.APPROVED,
            createdBy: post.userId,

            images: {
              create: post.images.map((image) => ({
                imageUrl: image.imageUrl,
                uploadedBy: post.userId,
              })),
            },
          },
        });

        await tx.feedPost.update({
          where: { id },
          data: {
            destinationId: destination.id,
          },
        });
      }

      return tx.feedPost.findUniqueOrThrow({
        where: { id },
        include: {
          proposal: true,
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
        destination: {
          select: { id: true, name: true, district: true },
        },
        proposal: {
          include: {
            category: true,
          },
        },
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
        destination: {
          select: { id: true, name: true, district: true },
        },
        proposal: {
          include: {
            category: true,
          },
        },
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
}
