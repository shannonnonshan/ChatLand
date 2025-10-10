import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type Message = {
  id: number;
  fromMe: boolean;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: Date;
  seen: boolean;
};

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /** Lấy danh sách bạn bè */
  async getFriends(userId: number) {
    const friendships = await this.prisma.friendship.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      include: { userA: true, userB: true },
    });

    const friends = friendships.map((f) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      f.userAId === userId ? f.userB : f.userA,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return friends.map((f) => ({
      id: f.id,
      name: f.name,
      avatar: f.avatar || '/logo.png',
      online: false, // frontend sẽ cập nhật realtime
    }));
  }

  /** Lấy lịch sử chat 1-1 */
  async getChatHistory(userId: number, friendId: number): Promise<Message[]> {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: { sender: true },
    });

    return messages.map((m) => ({
      id: m.id,
      fromMe: m.senderId === userId,
      senderId: m.senderId,
      senderName: m.sender.name,
      senderAvatar: m.sender.avatar || '/logo.png',
      content: m.content,
      createdAt: m.createdAt,
      seen: m.seen,
    }));
  }

  /** Gửi tin nhắn 1-1 */
  async sendMessage(from: number, to: number, text: string): Promise<Message> {
    const message = await this.prisma.message.create({
      data: { content: text, senderId: from, receiverId: to, seen: false },
      include: { sender: true },
    });

    return {
      id: message.id,
      fromMe: true,
      senderId: message.senderId,
      senderName: message.sender.name,
      senderAvatar: message.sender.avatar || '/logo.png',
      content: message.content,
      createdAt: message.createdAt,
      seen: message.seen,
    };
  }

  /** Đánh dấu tin nhắn đã xem */
  async markMessagesAsSeen(userId: number, friendId: number) {
    await this.prisma.message.updateMany({
      where: { senderId: friendId, receiverId: userId, seen: false },
      data: { seen: true },
    });
    return true;
  }
}