import { ItineraryEntity } from '../entities/itinerary.entity';
import { ItineraryResponseDto } from '../dto/itinerary-response.dto';

export class ItineraryMapper {
  static toResponseDto(entity: ItineraryEntity): ItineraryResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      title: entity.title,
      startDate: entity.startDate.toISOString().split('T')[0],
      endDate: entity.endDate.toISOString().split('T')[0],
      budget: Number(entity.budget),
    };
  }
}
