import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ItineraryService } from '../services/itinerary.service';
import { CreateChecklistDto, UpdateChecklistDto, SaveFullItineraryDto } from '../dto/checklist.dto';

@Controller('itineraries')
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) { }

  @Get('user/:userId')
  async getUserItineraries(@Param('userId', ParseIntPipe) userId: number) {
      return this.itineraryService.getUserItineraries(userId);
    }

    @Get('checklists/all')
    async getAllChecklists() {
      return this.itineraryService.getAllChecklists();
    }

    @Get(':id')
    async getItineraryById(@Param('id', ParseIntPipe) id: number) {
      return this.itineraryService.getItineraryById(id);
    }

    @Post('save-full')
    async saveFullItinerary(@Body() dto: SaveFullItineraryDto) {
      return this.itineraryService.saveFullItinerary(dto);
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
