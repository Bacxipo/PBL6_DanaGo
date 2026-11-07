import { DestinationEntity } from '../../destination/entities/destination.entity';

export class FavoriteEntity {
  userId: number;
  destinationId: number;
  createdAt: Date;
  destination: DestinationEntity;
}
