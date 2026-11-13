import { LodgingEntity } from '../entities/lodging.entity';
import { LodgingResponseDto } from '../dto/lodging-response.dto';

export class LodgingMapper {
  static toResponseDto(entity: LodgingEntity): LodgingResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      district: entity.district,
      region: entity.region,
      latitude: entity.latitude,
      longitude: entity.longitude,
      pricePerNight: entity.pricePerNight,
      pricePpNight: entity.pricePpNight,
      maxGuests: entity.maxGuests,
      checkin: entity.checkin,
      checkout: entity.checkout,
      avgRating: entity.avgRating,
      description: entity.description,
      status: entity.status,
      createdAt: entity.createdAt,
      addressUrl: entity.addressUrl,
      website: entity.website,
      images: entity.images
        ? entity.images.map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl,
          }))
        : [],
      amenities: entity.amenities ?? [],
      amenityIds: entity.amenityIds ?? [],
    };
  }
}
