import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ItineraryController } from './controllers/itinerary.controller';
import { ItineraryService } from './services/itinerary.service';
import { ItineraryRepository } from './repositories/itinerary.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'danago_secret_key_change_in_production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [ItineraryController],
  providers: [ItineraryService, ItineraryRepository],
  exports: [ItineraryService, ItineraryRepository],
})
export class ItineraryModule {}
