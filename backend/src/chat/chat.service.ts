import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Conversation, Participant } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // Tìm hoặc tạo conversation 1-1
  async findOrCreateConversation(
    userAId: number,
    userBId: number,
  ): Promise<Conversation & { participants: Participant[] }> {
    const existing = await this.prisma.conversation.findFirst({
      where: {
        isGroup: false,
        participants: { some: { userId: userAId } },
        AND: { participants: { some: { userId: userBId } } },
      },
      include: { participants: true },
    });

    if (existing)
      return existing as Conversation & { participants: Participant[] };

    const newConversation = await this.prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { user: { connect: { id: userAId } } },
            { user: { connect: { id: userBId } } },
          ],
        },
      },
      include: { participants: true },
    });

    return newConversation;
  }

  // Lưu message mới
  async saveMessage(senderId: number, receiverId: number, content: string) {
    const conversation = await this.findOrCreateConversation(
      senderId,
      receiverId,
    );

    const message = await this.prisma.message.create({
      data: {
        content,
        sender: { connect: { id: senderId } },
        conversation: { connect: { id: conversation.id } },
      },
      include: { sender: true, conversation: true },
    });

    return message;
  }

  // Lấy tất cả message theo conversation
  async getMessages(conversationId: number) {
    return await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, email: true } } },
    });
  }
}
