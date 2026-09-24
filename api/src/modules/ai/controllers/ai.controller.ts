import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AiService } from '../services/ai.service';
import { SendChatMessageDto, GenerateItineraryAiDto } from '../dto/chat-ai.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('sessions')
  async getUserSessions(@CurrentUser('userId') userId: number) {
    return this.aiService.getUserSessions(userId);
  }

  @Get('sessions/:id')
  async getSessionDetail(
    @Param('id', ParseIntPipe) sessionId: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.aiService.getSessionDetail(sessionId, userId);
  }

  @Post('chat')
  async sendMessage(
    @CurrentUser('userId') userId: number,
    @Body() dto: SendChatMessageDto,
  ) {
    return this.aiService.sendMessage(userId, dto);
  }

  @Post('generate-itinerary')
  async generateItinerary(
    @CurrentUser('userId') userId: number,
    @Body() dto: GenerateItineraryAiDto,
  ) {
    return this.aiService.generateItinerary(userId, dto);
  }
}
