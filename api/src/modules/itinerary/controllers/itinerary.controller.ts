import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { ItineraryService } from '../services/itinerary.service';
import { CreateChecklistDto, UpdateChecklistDto, SaveFullItineraryDto } from '../dto/checklist.dto';

// Phải đăng nhập; lịch trình chỉ chủ sở hữu (hoặc ADMIN/STAFF) mới xem/sửa/xóa được
@UseGuards(JwtAuthGuard)
@Controller('itineraries')
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) { }

  @Get('user/:userId')
  async getUserItineraries(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: { sub: number; role: string },
  ) {
    return this.itineraryService.getUserItineraries(userId, user);
  }

  @Get('checklists/all')
  async getAllChecklists() {
    return this.itineraryService.getAllChecklists();
  }

  @Get(':id')
  async getItineraryById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { sub: number; role: string },
  ) {
    return this.itineraryService.getItineraryById(id, user);
  }

  @Post('save-full')
  async saveFullItinerary(
    @Body() dto: SaveFullItineraryDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.itineraryService.saveFullItinerary(dto, userId);
  }

  @Delete(':id')
  async deleteItinerary(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { sub: number; role: string },
  ) {
    return this.itineraryService.deleteItinerary(id, user);
  }

  @Get(':itineraryId/checklists')
  async getChecklistsByItinerary(@Param('itineraryId', ParseIntPipe) itineraryId: number) {
    return this.itineraryService.getChecklistsByItinerary(itineraryId);
  }

  @Get('items/:itemId/checklists')
  async getChecklistsByItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.itineraryService.getChecklistsByItem(itemId);
  }

  @Post('items/:itemId/checklists')
  async createChecklistItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CreateChecklistDto,
  ) {
    return this.itineraryService.createChecklistItem(itemId, dto);
  }

  @Patch('checklists/:id')
  async updateChecklistItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChecklistDto,
  ) {
    return this.itineraryService.updateChecklistItem(id, dto);
  }

  @Delete('checklists/:id')
  async deleteChecklistItem(@Param('id', ParseIntPipe) id: number) {
    return this.itineraryService.deleteChecklistItem(id);
  }
}
