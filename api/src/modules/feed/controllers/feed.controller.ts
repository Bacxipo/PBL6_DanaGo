import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FeedService } from '../services/feed.service';
import { CreateFeedPostDto, CreateFeedCommentDto } from '../dto/create-feed-post.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { UserRole, ContentStatus } from '@prisma/client';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  async createPost(
    @CurrentUser('userId') userId: number,
    @Body() dto: CreateFeedPostDto,
  ) {
    return this.feedService.createPost(userId, dto);
  }

  @Get('posts')
  async getAllPosts(
    @Query('status') status?: ContentStatus,
    @CurrentUser('userId') currentUserId?: number,
  ) {
    return this.feedService.getAllPosts(status, currentUserId);
  }

  @Get('posts/:id')
  async getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.feedService.getPostById(id);
  }

  @Patch('posts/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async updatePostStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: ContentStatus,
  ) {
    return this.feedService.updatePostStatus(id, status);
  }

  @Post('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Param('id', ParseIntPipe) postId: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.feedService.toggleLike(postId, userId);
  }

  @Post('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Param('id', ParseIntPipe) postId: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: CreateFeedCommentDto,
  ) {
    return this.feedService.addComment(postId, userId, dto);
  }

  @Get('posts/:id/comments')
  async getComments(@Param('id', ParseIntPipe) postId: number) {
    return this.feedService.getComments(postId);
  }
}
