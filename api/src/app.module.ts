import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/database/database.module';
import { StorageModule } from './shared/storage/storage.module';
import { IdentityModule } from './modules/identity/identity.module';
import { DestinationModule } from './modules/destination/destination.module';
import { ItineraryModule } from './modules/itinerary/itinerary.module';
import { CommunityModule } from './modules/community/community.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FeedModule } from './modules/feed/feed.module';
import { AiModule } from './modules/ai/ai.module';
import { EventModule } from './modules/event/event.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { LodgingModule } from './modules/lodging/lodging.module';
@Module({
  imports: [
    DatabaseModule,
    StorageModule,
    IdentityModule,
    DestinationModule,
    ItineraryModule,
    CommunityModule,
    NotificationModule,
    FeedModule,
    AiModule,
    EventModule,
    FavoriteModule,
    LodgingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
