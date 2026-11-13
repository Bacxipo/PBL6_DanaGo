import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EventService } from '../services/event.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { UpdateEventStatusDto } from '../dto/update-event-status.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../shared/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { EventNotFoundException } from '../exceptions/event-not-found.exception';
import { UserRole, ContentStatus } from '@prisma/client';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // Token ký với { sub, username, role } nên mã người dùng lấy từ 'sub' (không phải 'userId')
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreateEventDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.eventService.createEvent(dto, userId);
  }

  // Công khai: khách chỉ thấy sự kiện đã duyệt; ADMIN/STAFF (có token) mới lọc được theo trạng thái khác.
  // Có token thì trả thêm isFavorited của người đang đăng nhập.
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async getAll(
    @Query('status') status?: ContentStatus,
    @CurrentUser('role') role?: UserRole,
    @CurrentUser('sub') currentUserId?: number,
  ) {
    const canModerate = role === UserRole.ADMIN || role === UserRole.STAFF;
    const targetStatus = canModerate ? status || ContentStatus.APPROVED : ContentStatus.APPROVED;
    return this.eventService.getAllEvents(targetStatus, currentUserId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('role') role?: UserRole,
    @CurrentUser('sub') currentUserId?: number,
  ) {
    const event = await this.eventService.getEventById(id, currentUserId);
    const canModerate = role === UserRole.ADMIN || role === UserRole.STAFF;
    // Sự kiện chưa duyệt/bị từ chối: giấu với khách (trả 404 như không tồn tại)
    if (event.status !== ContentStatus.APPROVED && !canModerate) {
      throw new EventNotFoundException(id);
    }
    return event;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventService.updateEvent(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventStatusDto,
  ) {
    return this.eventService.updateEventStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.deleteEvent(id);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(
    @Param('id', ParseIntPipe) eventId: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.eventService.toggleFavorite(eventId, userId);
  }

  // --- Upload và quản lý ảnh của sự kiện (giống destination.controller.ts) ---
  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser('sub') userId: number,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất 1 ảnh để tải lên (field: images).');
    }
    return this.eventService.uploadImages(id, files, userId);
  }

  @Delete('images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async deleteImage(@Param('imageId', ParseIntPipe) imageId: number) {
    return this.eventService.deleteImage(imageId);
  }
}
