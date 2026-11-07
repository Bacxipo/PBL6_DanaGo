import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FeedService } from '../services/feed.service';
import { CreateFeedPostDto, CreateFeedCommentDto } from '../dto/create-feed-post.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { UserRole, ContentStatus } from '@prisma/client';
import { OptionalJwtAuthGuard } from '../../../shared/guards/optional-jwt-auth.guard';
import { ModerateFeedPostDto } from '../dto/moderate-feed-post.dto';
import { UpdateFeedPostDto } from '../dto/update-feed-post.dto';
import { BadRequestException, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) { }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_request, file, callback) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async createPost(
    @CurrentUser('sub') userId: number,
    @Body('data') rawData: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let parsed: unknown;

    try {
      parsed = JSON.parse(rawData);
    } catch {
      throw new BadRequestException(
        'Trường data phải là JSON hợp lệ.',
      );
    }

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      throw new BadRequestException('Dữ liệu bài viết không hợp lệ.');
    }

    // Ảnh phải đến từ files, không nhận URL do client tự gửi.
    if ('images' in parsed) {
      throw new BadRequestException(
        'Vui lòng gửi ảnh bằng trường files.',
      );
    }

    const dto = plainToInstance(CreateFeedPostDto, parsed);

    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length) {
      throw new BadRequestException(errors);
    }

    return this.feedService.createPostWithImages(
      userId,
      dto,
      files ?? [],
    );
  }

  @Get('posts')
  @UseGuards(OptionalJwtAuthGuard)
  async getAllPosts(
    @Query('status') status?: ContentStatus,
    @CurrentUser('sub') currentUserId?: number,
    @CurrentUser('role') role?: UserRole,
  ) {
    return this.feedService.getAllPosts(
      status,
      currentUserId,
      role,
    );
  }

  @Get('posts/mine')
  @UseGuards(JwtAuthGuard)
  async getMyPosts(@CurrentUser('sub') userId: number) {
    return this.feedService.getMyPosts(userId);
  }

  @Get('users/:userId/posts')
  @UseGuards(OptionalJwtAuthGuard)
  getUserPosts(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser('sub') currentUserId?: number,
  ) {
    return this.feedService.getUserPosts(userId, currentUserId);
  }

  @Get('posts/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async getPostById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') currentUserId?: number,
    @CurrentUser('role') role?: UserRole,
  ) {
    return this.feedService.getVisiblePostById(
      id,
      currentUserId,
      role,
    );
  }

  @Patch('posts/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async updatePostStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModerateFeedPostDto,
  ) {
    return this.feedService.updatePostStatus(id, dto.status);
  }

  @Post('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Param('id', ParseIntPipe) postId: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.feedService.toggleLike(postId, userId);
  }

  @Post('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Param('id', ParseIntPipe) postId: number,
    @CurrentUser('sub') userId: number,
    @Body() dto: CreateFeedCommentDto,
  ) {
    return this.feedService.addComment(postId, userId, dto);
  }

  @Get('posts/:id/comments')
  async getComments(@Param('id', ParseIntPipe) postId: number) {
    return this.feedService.getComments(postId);
  }
  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.feedService.deletePost(id, userId);
  }

  @Patch('posts/:id')
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param('id', ParseIntPipe) postId: number,
    @CurrentUser('sub') userId: number,
    @Body() dto: UpdateFeedPostDto,
  ) {
    return this.feedService.updatePost(postId, userId, dto);
  }
}
