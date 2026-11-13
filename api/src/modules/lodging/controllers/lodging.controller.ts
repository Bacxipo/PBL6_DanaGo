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
import { LodgingService } from '../services/lodging.service';
import { LodgingResponseDto, LodgingImageDto, AmenityResponseDto } from '../dto/lodging-response.dto';
import { CreateLodgingDto } from '../dto/create-lodging.dto';
import { UpdateLodgingDto } from '../dto/update-lodging.dto';
import { UpdateLodgingStatusDto } from '../dto/update-lodging-status.dto';
import { OptionalJwtAuthGuard } from '../../../shared/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('lodgings')
@Controller('lodgings')
export class LodgingController {
  constructor(private readonly lodgingService: LodgingService) {}

  @Get('amenities')
  @ApiOperation({ summary: 'Lấy danh sách tiện ích nơi lưu trú' })
  async getAmenities(): Promise<AmenityResponseDto[]> {
    return this.lodgingService.getAllAmenities();
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách nơi lưu trú (kèm bộ lọc số người, tiện ích, loại nơi ở, khu vực)' })
  async getAll(
    @Query('status') status?: string,
    @CurrentUser('role') role?: UserRole,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('district') district?: string,
    @Query('region') region?: string,
    @Query('guests') guests?: string,
    @Query('maxGuests') maxGuests?: string,
    @Query('amenities') amenities?: string,
  ): Promise<LodgingResponseDto[]> {
    const canModerate = role === UserRole.ADMIN || role === UserRole.STAFF;
    const targetStatus = canModerate ? (status || 'APPROVED') : 'APPROVED';
    const parsedGuests = guests
      ? Number(guests)
      : maxGuests
        ? Number(maxGuests)
        : undefined;
    const parsedAmenities = amenities
      ? amenities
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    return this.lodgingService.getAllLodgings({
      status: targetStatus,
      search,
      type,
      district,
      region,
      guests: parsedGuests,
      amenities: parsedAmenities,
    });
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('role') role?: UserRole,
  ): Promise<LodgingResponseDto> {
    const lodging = await this.lodgingService.getLodgingById(id);
    if (
      lodging.status !== 'APPROVED' &&
      role !== UserRole.ADMIN &&
      role !== UserRole.STAFF
    ) {
      throw new NotFoundException('Không tìm thấy nơi lưu trú.');
    }
    return lodging;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async create(@Body() dto: CreateLodgingDto): Promise<LodgingResponseDto> {
    return this.lodgingService.createLodging(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLodgingDto,
  ): Promise<LodgingResponseDto> {
    return this.lodgingService.updateLodging(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLodgingStatusDto,
  ): Promise<LodgingResponseDto> {
    return this.lodgingService.updateLodgingStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.lodgingService.deleteLodging(id);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<LodgingImageDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        'Vui lòng chọn ít nhất 1 ảnh để tải lên (field: images).',
      );
    }
    return this.lodgingService.uploadImages(id, files);
  }

  @Delete('images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async deleteImage(
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<{ message: string }> {
    return this.lodgingService.deleteImage(imageId);
  }
}
