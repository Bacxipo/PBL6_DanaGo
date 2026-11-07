import { DestinationMapper } from '../../destination/mappers/destination.mapper';
import { FavoriteResponseDto } from '../dto/favorite-response.dto';
import { FavoriteEntity } from '../entities/favorite.entity';

export class FavoriteMapper {
  static toResponseDto(entity: FavoriteEntity): FavoriteResponseDto {
    return {
      destinationId: entity.destinationId,
      createdAt: entity.createdAt,
      destination: DestinationMapper.toResponseDto(entity.destination),
    };
  }
}
