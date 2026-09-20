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
} from '@nestjs/common';
import { DestinationService } from '../services/destination.service';
import { DestinationResponseDto } from '../dto/destination-response.dto';
import { CreateDestinationDto } from '../dto/create-destination.dto';
import { UpdateDestinationDto } from '../dto/update-destination.dto';
import { UpdateDestinationStatusDto } from '../dto/update-destination-status.dto';
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
    @CurrentUser('userId') userId: number,
  ): Promise<DestinationResponseDto> {
    return this.destinationService.createDestination(dto, userId);
  }

  @Get()
  async getAll(
    @Query('status') status?: ContentStatus,
  ): Promise<DestinationResponseDto[]> {
    // Mặc định khách/User chỉ xem điểm đến đã APPROVED, ngoại trừ khi truyền status khác (nếu cần cho admin)
    const targetStatus = status || ContentStatus.APPROVED;
    return this.destinationService.getAllDestinations(targetStatus);
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DestinationResponseDto> {
    return this.destinationService.getDestinationById(id);
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
}
