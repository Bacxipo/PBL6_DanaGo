import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DestinationController } from './controllers/destination.controller';
import { DestinationService } from './services/destination.service';
import { DestinationRepository } from './repositories/destination.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'danago_secret_key_change_in_production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [DestinationController],
  providers: [DestinationService, DestinationRepository],
  exports: [DestinationService, DestinationRepository],
})
export class DestinationModule {}
