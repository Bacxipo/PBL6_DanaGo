import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AiController } from './controllers/ai.controller';
import { AiService } from './services/ai.service';
import { AiRepository } from './repositories/ai.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'danago_secret_key_change_in_production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AiController],
  providers: [AiService, AiRepository],
  exports: [AiService, AiRepository],
})
export class AiModule {}
