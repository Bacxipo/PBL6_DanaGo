import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FeedController } from './controllers/feed.controller';
import { FeedService } from './services/feed.service';
import { FeedRepository } from './repositories/feed.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'danago_secret_key_change_in_production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [FeedController],
  providers: [FeedService, FeedRepository],
  exports: [FeedService, FeedRepository],
})
export class FeedModule {}
