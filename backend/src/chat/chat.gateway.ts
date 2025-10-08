import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // Map userId -> set of socketIds (hỗ trợ multi-tab / multi-device)
  private users = new Map<number, Set<string>>();

  constructor(private readonly chatService: ChatService) {}

  /** Đăng ký user socket */
  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    if (!userId) return;

    let socketSet = this.users.get(userId);
    if (!socketSet) {
      socketSet = new Set<string>();
      this.users.set(userId, socketSet);
    }
    socketSet.add(client.id);
    console.log(`✅ User ${userId} registered`);
  }

  /** Xử lý disconnect */
  handleDisconnect(client: Socket) {
    for (const [userId, socketSet] of this.users.entries()) {
      if (socketSet.has(client.id)) {
        socketSet.delete(client.id);
        if (socketSet.size === 0) this.users.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  }

  /** Lấy lịch sử chat 1-1 */
  @SubscribeMessage('getHistory')
  async handleGetHistory(
    @MessageBody() payload: { userAId: number; userBId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const conversation = await this.chatService.findOrCreateConversation(
      payload.userAId,
      payload.userBId,
    );
    const messages = await this.chatService.getMessages(conversation.id);

    client.emit(
      'chatHistory',
      messages.map((m) => ({
        id: m.id.toString(),
        senderId: m.senderId,
        content: m.content,
        createdAt: m.createdAt.getTime(),
      })),
    );
  }

  /** Gửi message private */
  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody()
    data: { clientId: string; from: number; to: number; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // 1️⃣ Lưu message vào DB
      const message = await this.chatService.saveMessage(
        data.from,
        data.to,
        data.text,
      );

      // 2️⃣ Gửi status 'sent' cho sender
      client.emit('messageStatus', {
        messageId: data.clientId,
        status: 'sent',
      });

      // 3️⃣ Gửi message cho tất cả socket online của receiver
      const sockets = this.users.get(data.to);
      if (sockets?.size) {
        for (const sockId of sockets) {
          this.server.to(sockId).emit('privateMessage', {
            id: message.id.toString(),
            from: message.senderId,
            text: message.content,
            timestamp: message.createdAt.getTime(),
          });
        }

        // 4️⃣ Gửi status 'delivered' cho sender
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
