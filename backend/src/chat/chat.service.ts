import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Conversation, Participant, Message } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tìm conversation 1-1 giữa 2 user
   * Nếu không tồn tại thì tạo mới
   */
  async findOrCreateConversation(
    userAId: number,
    userBId: number,
  ): Promise<Conversation & { participants: Participant[] }> {
    // Tìm conversation 1-1 có đúng 2 participants
    const existing = await this.prisma.conversation.findFirst({
      where: {
        isGroup: false,
        participants: {
          every: { userId: { in: [userAId, userBId] } },
        },
      },
      include: { participants: true },
    });

    if (existing)
      return existing as Conversation & { participants: Participant[] };

    // Tạo mới conversation 1-1
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

  /**
   * Lưu message mới vào conversation 1-1
   */
  async saveMessage(
    senderId: number,
    receiverId: number,
    content: string,
  ): Promise<Message> {
    const conversation = await this.findOrCreateConversation(
      senderId,
      receiverId,
    );

    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        conversationId: conversation.id,
      },
      include: {
        sender: { select: { id: true, name: true, email: true, avatar: true } },
        conversation: { include: { participants: true } },
      },
    });

    return message;
  }

  /**
   * Lấy tất cả message theo conversation, sắp xếp theo thời gian
   */
  async getMessages(conversationId: number): Promise<Message[]> {
    return await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }

  /**
   * Lấy danh sách conversation của user kèm last message
   */
  async getUserConversations(userId: number) {
    const conversations = await this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: { include: { user: true } },
        messages: true, // lấy tất cả message
      },
    });

    // Sort messages theo createdAt descending
    return conversations.map((conv) => ({
      ...conv,
      messages: conv.messages.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    }));
  }
}
