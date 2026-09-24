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
import { EventService } from '../services/event.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { UpdateEventStatusDto } from '../dto/update-event-status.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { UserRole, ContentStatus } from '@prisma/client';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreateEventDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.eventService.createEvent(dto, userId);
  }

  @Get()
  async getAll(
    @Query('status') status?: ContentStatus,
    @CurrentUser('userId') currentUserId?: number,
  ) {
    return this.eventService.getAllEvents(status, currentUserId);
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') currentUserId?: number,
  ) {
    return this.eventService.getEventById(id, currentUserId);
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
    @CurrentUser('userId') userId: number,
  ) {
    return this.eventService.toggleFavorite(eventId, userId);
  }
}
