import { DestinationResponseDto } from '../../destination/dto/destination-response.dto';

export class FavoriteResponseDto {
  destinationId: number;
  createdAt: Date;
  destination: DestinationResponseDto;
}

export class FavoriteStatusResponseDto {
  isFavorited: boolean;
}
