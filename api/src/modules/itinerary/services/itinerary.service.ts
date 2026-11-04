import { Injectable } from '@nestjs/common';
import { ItineraryRepository } from '../repositories/itinerary.repository';
import { ItineraryMapper } from '../mappers/itinerary.mapper';
import { ItineraryResponseDto } from '../dto/itinerary-response.dto';

@Injectable()
export class ItineraryService {
  constructor(private readonly itineraryRepository: ItineraryRepository) {}

  async getUserItineraries(userId: number): Promise<ItineraryResponseDto[]> {
    const list = await this.itineraryRepository.findByUserId(userId);
    return list.map(item => ItineraryMapper.toResponseDto(item));
  }
}
