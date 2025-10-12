// chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway(3002, { cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer() server: Server;
  private onlineUsers = new Map<number, string>(); // userId -> socketId

  constructor(private prisma: PrismaService) {}

  /** Đăng ký user online */
  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    this.onlineUsers.set(userId, client.id);
    this.server.emit('userList', Array.from(this.onlineUsers.keys()));
  }

  /** Gửi tin nhắn 1-1 */
  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
  @MessageBody()
  payload: {
    clientId: string;
    from: number;
    to: number;
    text: string;
    type?: 'text' | 'audio' | 'image';
    mediaUrl?: string | null;
  },
) {
  const { clientId, from, to, text, type = 'text', mediaUrl = null } = payload;

  // Lưu message vào DB
  const message = await this.prisma.message.create({
    data: {
      type,
      content: text,
      mediaUrl,
      senderId: from,
      receiverId: to,
      seen: false,
    },
  });

  // Gửi cho người nhận (nếu online)
  const toSocketId = this.onlineUsers.get(to);
  if (toSocketId)
    this.server.to(toSocketId).emit('privateMessage', {
      id: clientId,
      from: String(from),
      text,
      type,
      mediaUrl,
      timestamp: message.createdAt.getTime(),
    });

  // Gửi lại trạng thái cho người gửi
  const fromSocketId = this.onlineUsers.get(from);
  if (fromSocketId)
    this.server
      .to(fromSocketId)
      .emit('messageStatus', { messageId: clientId, status: 'sent' });
}
  @SubscribeMessage('markAsSeen')
  async handleMarkAsSeen(
    @MessageBody() payload: { userId: number; friendId: number },
  ) {
    const { userId, friendId } = payload;

    // Cập nhật trong DB
    await this.prisma.message.updateMany({
      where: { senderId: friendId, receiverId: userId, seen: false },
      data: { seen: true },
    });

    // Gửi thông báo realtime cho người gửi
    const senderSocketId = this.onlineUsers.get(friendId);
    if (senderSocketId) {
      this.server.to(senderSocketId).emit('messagesSeen', { by: userId });
    }
}
  /** Lấy lịch sử chat giữa 2 người */
  @SubscribeMessage('getHistory')
  async handleGetHistory(
    @MessageBody() payload: { userAId: number; userBId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: payload.userAId, receiverId: payload.userBId },
          { senderId: payload.userBId, receiverId: payload.userAId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
    client.emit('chatHistory', messages);
  }
}