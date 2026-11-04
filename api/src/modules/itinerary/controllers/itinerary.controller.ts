import { Controller, Get, Param } from '@nestjs/common';
import { ItineraryService } from '../services/itinerary.service';
import { ItineraryResponseDto } from '../dto/itinerary-response.dto';

@Controller('itineraries')
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Get('user/:userId')
  async getUserItineraries(@Param('userId') userId: string): Promise<ItineraryResponseDto[]> {
    return this.itineraryService.getUserItineraries(+userId);
  }
}
