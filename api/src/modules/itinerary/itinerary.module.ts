import { Module } from '@nestjs/common';
import { ItineraryController } from './controllers/itinerary.controller';
import { ItineraryService } from './services/itinerary.service';
import { ItineraryRepository } from './repositories/itinerary.repository';

@Module({
  controllers: [ItineraryController],
  providers: [ItineraryService, ItineraryRepository],
  exports: [ItineraryService, ItineraryRepository],
})
export class ItineraryModule {}
