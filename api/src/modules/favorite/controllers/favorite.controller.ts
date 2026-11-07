import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import {
  FavoriteResponseDto,
  FavoriteStatusResponseDto,
} from '../dto/favorite-response.dto';
import { FavoriteService } from '../services/favorite.service';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách địa điểm yêu thích của tôi' })
  getUserFavorites(
    @CurrentUser('sub') userId: number,
  ): Promise<FavoriteResponseDto[]> {
    return this.favoriteService.getUserFavorites(userId);
  }

  @Post(':destinationId')
  @ApiOperation({ summary: 'Thêm địa điểm vào yêu thích' })
  addFavorite(
    @CurrentUser('sub') userId: number,
    @Param('destinationId', ParseIntPipe) destinationId: number,
  ): Promise<FavoriteStatusResponseDto> {
    return this.favoriteService.addFavorite(userId, destinationId);
  }

  @Delete(':destinationId')
  @ApiOperation({ summary: 'Bỏ yêu thích địa điểm' })
  removeFavorite(
    @CurrentUser('sub') userId: number,
    @Param('destinationId', ParseIntPipe) destinationId: number,
  ): Promise<FavoriteStatusResponseDto> {
    return this.favoriteService.removeFavorite(userId, destinationId);
  }
}
