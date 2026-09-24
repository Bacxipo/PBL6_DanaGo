import { Injectable } from '@nestjs/common';
import { FeedRepository } from '../repositories/feed.repository';
import { CreateFeedPostDto, CreateFeedCommentDto } from '../dto/create-feed-post.dto';
import { FeedPostNotFoundException } from '../exceptions/feed-post-not-found.exception';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class FeedService {
  constructor(private readonly feedRepository: FeedRepository) {}

  async createPost(userId: number, dto: CreateFeedPostDto) {
    return this.feedRepository.createPost(userId, dto);
  }

  async getAllPosts(status?: ContentStatus, currentUserId?: number) {
    return this.feedRepository.findAllPosts(status || ContentStatus.APPROVED, currentUserId);
  }

  async getPostById(id: number) {
    const post = await this.feedRepository.findPostById(id);
    if (!post) {
      throw new FeedPostNotFoundException(id);
    }
    return post;
  }

  async updatePostStatus(id: number, status: ContentStatus) {
    await this.getPostById(id);
    return this.feedRepository.updatePostStatus(id, status);
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
}
