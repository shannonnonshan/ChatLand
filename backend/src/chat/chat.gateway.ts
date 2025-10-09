// chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';

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
      clientId: string; // id tạm frontend
      from: number;
      to: number;
      text: string;
    },
  ) {
    const { clientId, from, to, text } = payload;

    // Lưu message
    const message = await this.prisma.message.create({
      data: {
        content: text,
        senderId: from,
        receiverId: to,
        seen: false,
      },
    });

    // Gửi cho người nhận nếu online
    const toSocketId = this.onlineUsers.get(to);
    if (toSocketId)
      this.server.to(toSocketId).emit('privateMessage', {
        id: clientId,
        from: String(from),
        text,
        timestamp: message.createdAt.getTime(),
      });

    // Gửi trạng thái "sent" cho sender
    const fromSocketId = this.onlineUsers.get(from);
    if (fromSocketId)
      this.server
        .to(fromSocketId)
        .emit('messageStatus', { messageId: clientId, status: 'sent' });
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
