import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FavoriteController } from './controllers/favorite.controller';
import { FavoriteRepository } from './repositories/favorite.repository';
import { FavoriteService } from './services/favorite.service';

@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_SECRET || 'danago_secret_key_change_in_production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [FavoriteController],
  providers: [FavoriteService, FavoriteRepository],
  exports: [FavoriteService, FavoriteRepository],
})
export class FavoriteModule {}
