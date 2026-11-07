import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DestinationNotFoundException } from '../../destination/exceptions/destination-not-found.exception';
import {
  FavoriteResponseDto,
  FavoriteStatusResponseDto,
} from '../dto/favorite-response.dto';
import { FavoriteMapper } from '../mappers/favorite.mapper';
import { FavoriteRepository } from '../repositories/favorite.repository';

@Injectable()
export class FavoriteService {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  // Lấy danh sách yêu thích của người đang đăng nhập.
  async getUserFavorites(userId: number): Promise<FavoriteResponseDto[]> {
    this.validateUserId(userId);
    const favorites = await this.favoriteRepository.findAllByUserId(userId);
    return favorites.map((favorite) => FavoriteMapper.toResponseDto(favorite));
  }

  async addFavorite(
    userId: number,
    destinationId: number,
  ): Promise<FavoriteStatusResponseDto> {
    this.validateUserId(userId);
    const destination =
      await this.favoriteRepository.findApprovedDestination(destinationId);

    // Chỉ cho lưu địa điểm đang được công khai.
    if (!destination) {
      throw new DestinationNotFoundException(destinationId);
    }

    await this.favoriteRepository.add(userId, destinationId);

    return { isFavorited: true };
  }

  async removeFavorite(
    userId: number,
    destinationId: number,
  ): Promise<FavoriteStatusResponseDto> {
    this.validateUserId(userId);
    await this.favoriteRepository.remove(userId, destinationId);

    return { isFavorited: false };
  }

  private validateUserId(userId: number): void {
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new UnauthorizedException('Thông tin người dùng không hợp lệ.');
    }
  }
}
