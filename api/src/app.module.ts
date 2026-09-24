import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/database/database.module';
import { IdentityModule } from './modules/identity/identity.module';
import { DestinationModule } from './modules/destination/destination.module';
import { ItineraryModule } from './modules/itinerary/itinerary.module';
import { CommunityModule } from './modules/community/community.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FeedModule } from './modules/feed/feed.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    DatabaseModule,
    IdentityModule,
    DestinationModule,
    ItineraryModule,
    CommunityModule,
    NotificationModule,
    FeedModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
