import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class AiRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: number, title?: string) {
    return this.prisma.chatSession.create({
      data: {
        userId,
        title: title || 'Trò chuyện mới',
      },
    });
  }

  async findSessionsByUserId(userId: number) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findSessionById(id: number, userId: number) {
    return this.prisma.chatSession.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async addMessage(sessionId: number, sender: 'user' | 'assistant', message: string) {
    const chatMsg = await this.prisma.chatMessage.create({
      data: {
        sessionId,
        sender,
        message,
      },
    });

    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return chatMsg;
  }
}
