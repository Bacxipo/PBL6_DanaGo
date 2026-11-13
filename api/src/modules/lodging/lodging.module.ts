import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LodgingController } from './controllers/lodging.controller';
import { LodgingService } from './services/lodging.service';
import { LodgingRepository } from './repositories/lodging.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'danago_secret_key_change_in_production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [LodgingController],
  providers: [LodgingService, LodgingRepository],
  exports: [LodgingService, LodgingRepository],
})
export class LodgingModule { }
