export class ChatSessionEntity {
  id: number;
  userId: number;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ChatMessageEntity {
  id: number;
  sessionId: number;
  sender: 'user' | 'assistant';
  message: string;
  createdAt: Date;
}
