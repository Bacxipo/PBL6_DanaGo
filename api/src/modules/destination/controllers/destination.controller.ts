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
  NotFoundException,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DestinationService } from '../services/destination.service';
import { DestinationResponseDto, DestinationImageDto } from '../dto/destination-response.dto';
import { CreateDestinationDto } from '../dto/create-destination.dto';
import { UpdateDestinationDto } from '../dto/update-destination.dto';
import { UpdateDestinationStatusDto } from '../dto/update-destination-status.dto';
import { OptionalJwtAuthGuard } from '../../../shared/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { UserRole, ContentStatus } from '@prisma/client';

@Controller('destinations')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreateDestinationDto,
    @CurrentUser('sub') userId: number,
  ): Promise<DestinationResponseDto> {
    return this.destinationService.createDestination(dto, userId);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async getAll(
    @Query('status') status?: ContentStatus,
    @CurrentUser('role') role?: UserRole,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('district') district?: string,
  ): Promise<DestinationResponseDto[]> {
    const canModerate = role === UserRole.ADMIN || role === UserRole.STAFF;
    const targetStatus = canModerate
      ? (status || ContentStatus.APPROVED)
      : ContentStatus.APPROVED;
    const parsedCategoryId = categoryId ? Number(categoryId) : undefined;

    if (
      parsedCategoryId !== undefined &&
      (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0)
    ) {
      throw new BadRequestException('categoryId must be a positive integer.');
    }

    return this.destinationService.getAllDestinations(
      targetStatus,
      search,
      parsedCategoryId,
      district,
    );
  }

  @Get('categories')
  async getCategories() {
    return this.destinationService.getAllCategories();
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('role') role?: UserRole,
  ): Promise<DestinationResponseDto> {
    const destination = await this.destinationService.getDestinationById(id);
    if (destination.status !== ContentStatus.APPROVED && role !== UserRole.ADMIN && role !== UserRole.STAFF) {
      throw new NotFoundException('Destination not found.');
    }
    return destination;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDestinationDto,
  ): Promise<DestinationResponseDto> {
    return this.destinationService.updateDestination(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDestinationStatusDto,
  ): Promise<DestinationResponseDto> {
    return this.destinationService.updateDestinationStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.destinationService.deleteDestination(id);
  }

  // --- Upload và quản lý ảnh của điểm đến ---
  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser('sub') userId: number,
  ): Promise<DestinationImageDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất 1 ảnh để tải lên (field: images).');
    }
    return this.destinationService.uploadImages(id, files, userId);
  }

  @Delete('images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async deleteImage(
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<{ message: string }> {
    return this.destinationService.deleteImage(imageId);
  }
}
