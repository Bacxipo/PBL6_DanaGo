import { timeToMinutes } from '../../../shared/utils/time.utils';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateFeedPostDto, CreateFeedCommentDto } from '../dto/create-feed-post.dto';
import { ContentStatus, FeedPostType, NotificationType, Prisma } from '@prisma/client';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

const feedPostInclude = {
  images: true,
  user: {
    select: { id: true, username: true, fullName: true, avatarUrl: true },
  },
  destination: { include: { category: true } },
  _count: { select: { likes: true, comments: true } },
} satisfies Prisma.FeedPostInclude;

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
        include: feedPostInclude,
      });
    });
  }

  async attachImages(postId: number, userId: number, destinationId: number | null, urls: string[]) {
    return this.prisma.$transaction(async (tx) => {
      if (urls.length) {
        await tx.feedPostImage.createMany({
          data: urls.map((imageUrl) => ({ postId, imageUrl })),
        });
        if (destinationId !== null) {
          await tx.destinationImage.createMany({
            data: urls.map((imageUrl) => ({ destinationId, uploadedBy: userId, imageUrl })),
          });
        }
      }
      return tx.feedPost.findUniqueOrThrow({ where: { id: postId }, include: feedPostInclude });
    });
  }

  async rollbackCreatedPost(postId: number, newDestinationId: number | null) {
    await this.prisma.$transaction(async (tx) => {
      await tx.feedPost.delete({ where: { id: postId } });
      if (newDestinationId !== null) {
        await tx.destination.delete({ where: { id: newDestinationId } });
      }
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
        include: feedPostInclude,
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

      const isApproved = status === ContentStatus.APPROVED;
      await tx.notification.create({
        data: {
          userId: post.userId,
          type: NotificationType.COMMUNITY,
          title: isApproved ? 'Bài viết đã được duyệt' : 'Bài viết bị từ chối',
          content: isApproved
            ? 'Bài viết của bạn đã được Admin phê duyệt và hiển thị trên bảng tin cộng đồng!'
            : 'Bài viết của bạn chưa phù hợp với tiêu chuẩn cộng đồng DanaGo và đã bị từ chối.',
          referenceType: 'POST',
          referenceId: id,
        },
      });

      return tx.feedPost.findUniqueOrThrow({
        where: { id },
        include: feedPostInclude,
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
        ...feedPostInclude,
        likes: currentUserId ? { where: { userId: currentUserId } } : false,
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
      include: feedPostInclude,
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

      const post = await this.prisma.feedPost.findUnique({
        where: { id: postId },
        select: { userId: true },
      });
      if (post && post.userId !== userId) {
        const liker = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { fullName: true, username: true },
        });
        const likerName = liker?.fullName || liker?.username || 'Một người dùng';
        await this.prisma.notification.create({
          data: {
            userId: post.userId,
            type: NotificationType.COMMUNITY,
            title: 'Lượt thích mới',
            content: `${likerName} đã thích bài viết của bạn.`,
            referenceType: 'POST',
            referenceId: postId,
          },
        });
      }

      return { liked: true };
    }
  }

  async addComment(postId: number, userId: number, dto: CreateFeedCommentDto) {
    const comment = await this.prisma.feedComment.create({
      data: {
        postId,
        userId,
        content: dto.content,
      },
      include: {
        user: { select: { id: true, username: true, fullName: true, avatarUrl: true, supabaseId: true } },
      },
    });

    const post = await this.prisma.feedPost.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    const commenterName = comment.user.fullName || comment.user.username || 'Một người dùng';
    const truncated = dto.content.length > 50 ? `${dto.content.slice(0, 50)}...` : dto.content;
    const notifiedUserIds = new Set<number>([userId]);

    if (
      typeof dto.replyToUserId === 'number' &&
      Number.isInteger(dto.replyToUserId) &&
      !notifiedUserIds.has(dto.replyToUserId)
    ) {
      const targetUser = await this.prisma.user.findUnique({
        where: { id: dto.replyToUserId },
        select: { id: true },
      });
      if (targetUser) {
        await this.prisma.notification.create({
          data: {
            userId: targetUser.id,
            type: NotificationType.COMMUNITY,
            title: 'Phản hồi bình luận',
            content: `${commenterName} đã trả lời bình luận của bạn: "${truncated}"`,
            referenceType: 'POST',
            referenceId: postId,
          },
        });
        notifiedUserIds.add(targetUser.id);
      }
    }

    if (post && !notifiedUserIds.has(post.userId)) {
      await this.prisma.notification.create({
        data: {
          userId: post.userId,
          type: NotificationType.COMMUNITY,
          title: 'Bình luận mới',
          content: `${commenterName} đã bình luận: "${truncated}"`,
          referenceType: 'POST',
          referenceId: postId,
        },
      });
    }

    const { supabaseId, ...user } = comment.user;
    return { ...comment, user: { ...user, authProvider: supabaseId ? 'google' : 'password' } };
  }

  async getCommentsByPostId(postId: number) {
    const comments = await this.prisma.feedComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, username: true, fullName: true, avatarUrl: true, supabaseId: true } },
      },
    });
    return comments.map((comment) => {
      const { supabaseId, ...user } = comment.user;
      return { ...comment, user: { ...user, authProvider: supabaseId ? 'google' : 'password' } };
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
      data: {
        content,
        status: ContentStatus.PENDING,
      },
    });
    return this.findPostById(postId);
  }
}
