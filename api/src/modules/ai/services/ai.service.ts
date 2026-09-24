import { Injectable } from '@nestjs/common';
import { AiRepository } from '../repositories/ai.repository';
import { SendChatMessageDto, GenerateItineraryAiDto } from '../dto/chat-ai.dto';
import { ChatSessionNotFoundException } from '../exceptions/chat-session-not-found.exception';

@Injectable()
export class AiService {
  constructor(private readonly aiRepository: AiRepository) {}

  async getUserSessions(userId: number) {
    return this.aiRepository.findSessionsByUserId(userId);
  }

  async getSessionDetail(sessionId: number, userId: number) {
    const session = await this.aiRepository.findSessionById(sessionId, userId);
    if (!session) {
      throw new ChatSessionNotFoundException(sessionId);
    }
    return session;
  }

  async sendMessage(userId: number, dto: SendChatMessageDto) {
    let targetSessionId: number;

    if (!dto.sessionId) {
      const newSession = await this.aiRepository.createSession(
        userId,
        dto.message.slice(0, 30) + '...',
      );
      targetSessionId = newSession.id;
    } else {
      await this.getSessionDetail(dto.sessionId, userId);
      targetSessionId = dto.sessionId;
    }

    // 1. Lưu câu hỏi của User
    await this.aiRepository.addMessage(targetSessionId, 'user', dto.message);

    // 2. Tạm thời phản hồi giả lập (Hoặc sẵn sàng gọi sang LLM ngoài như Gemini/OpenAI hoặc Python Service)
    const assistantReply = `Tôi đã nhận được câu hỏi: "${dto.message}". Hệ thống AI DanaGo sẵn sàng tư vấn cho bạn!`;

    // 3. Lưu câu trả lời của AI Assistant
    const savedReply = await this.aiRepository.addMessage(targetSessionId, 'assistant', assistantReply);

    return {
      sessionId: targetSessionId,
      reply: savedReply,
    };
  }

  async generateItinerary(userId: number, dto: GenerateItineraryAiDto) {
    // Sẵn sàng gọi HTTP POST tới Python Service gợi ý lịch trình
    return {
      message: 'Gợi ý lịch trình từ AI Service',
      prompt: dto.prompt,
      days: dto.days || 3,
      suggestedItinerary: [
        { day: 1, title: 'Khám phá Bán đảo Sơn Trà & Bãi biển Mỹ Khê' },
        { day: 2, title: 'Vui chơi tại Bà Nà Hills' },
        { day: 3, title: 'Tham quan Ngũ Hành Sơn & Phố cổ Hội An' },
      ],
    };
  }
}
