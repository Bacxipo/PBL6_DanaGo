import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FeedController } from './controllers/feed.controller';
import { FeedService } from './services/feed.service';
import { FeedRepository } from './repositories/feed.repository';
import { DestinationModule } from '../destination/destination.module';
import { StorageModule } from '../../shared/storage/storage.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'danago_secret_key_change_in_production',
      signOptions: { expiresIn: '7d' },
    }),
    DestinationModule,
    StorageModule,
  ],
  controllers: [FeedController],
  providers: [FeedService, FeedRepository],
  exports: [FeedService, FeedRepository],
})
export class FeedModule { }
