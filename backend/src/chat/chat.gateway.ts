import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer() server: Server;
  private users = new Map<number, string>(); // userId -> socket.id

  constructor(private readonly chatService: ChatService) {}

  // Đăng ký socket user
  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    this.users.set(userId, client.id);
    console.log(`✅ User ${userId} registered`);
  }

  // Lấy lịch sử chat
  @SubscribeMessage('getHistory')
  async handleGetHistory(
    @MessageBody() payload: { userAId: number; userBId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const conversation = await this.chatService.findOrCreateConversation(
      payload.userAId,
      payload.userBId,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const messages = await this.chatService.getMessages(conversation.id);
    client.emit(
      'chatHistory',
      messages.map((m: any) => ({
        id: m.id.toString(),
        senderId: m.senderId,
        content: m.content,
        createdAt: m.createdAt.getTime(),
      })),
    );
  }

  // Gửi tin nhắn private
  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody()
    data: { clientId: string; from: number; to: number; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // 1️⃣ Lưu vào DB
      const message = await this.chatService.saveMessage(
        data.from,
        data.to,
        data.text,
      );

      // 2️⃣ Update status 'sent' cho sender
      client.emit('messageStatus', {
        messageId: data.clientId,
        status: 'sent',
      });

      // 3️⃣ Gửi message cho receiver nếu online
      const receiverSocketId = this.users.get(data.to);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('privateMessage', {
          id: message.id.toString(),
          from: message.senderId,
          text: message.content,
          timestamp: message.createdAt.getTime(),
        });

        // 4️⃣ Update status 'delivered' cho sender
        client.emit('messageStatus', {
          messageId: data.clientId,
          status: 'delivered',
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      client.emit('messageStatus', {
        messageId: data.clientId,
        status: 'failed',
      });
    }
  }
}
