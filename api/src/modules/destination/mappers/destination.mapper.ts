import { DestinationEntity } from '../entities/destination.entity';
import { DestinationResponseDto } from '../dto/destination-response.dto';

export class DestinationMapper {
  static toResponseDto(entity: DestinationEntity): DestinationResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description ?? undefined,
      district: entity.district,
      latitude: entity.latitude ? Number(entity.latitude) : undefined,
      longitude: entity.longitude ? Number(entity.longitude) : undefined,
      addressUrl: entity.addressUrl ?? undefined,
      categoryId: entity.categoryId ?? undefined,
      ticketPrice: entity.ticketPrice ?? undefined,
      openHours: entity.openHours ?? undefined,
      avgRating: entity.avgRating ? Number(entity.avgRating) : 0,
      status: entity.status,
      createdBy: entity.createdBy ?? undefined,
      createdAt: entity.createdAt,
    };
  }
}
