import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private users = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.users.entries()) {
      if (socketId === client.id) {
        this.users.delete(userId);
        console.log(`User ${userId} disconnected`);
        this.server.emit('userList', Array.from(this.users.keys()));
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.users.set(userId, client.id);
    console.log(`User ${userId} registered`);
    this.server.emit('userList', Array.from(this.users.keys()));
  }

  // Gửi tin nhắn riêng
  @SubscribeMessage('privateMessage')
  handlePrivateMessage(
    @MessageBody()
    payload: {
      id: string;
      from: string;
      to: string;
      text: string;
      timestamp: number;
    },
  ) {
    const { id, from, to, text, timestamp } = payload;
    const receiverSocket = this.users.get(to);

    console.log(`📨 ${from} → ${to}: ${text}`);

    // Phản hồi lại cho người gửi là "đã gửi"
    const senderSocket = this.users.get(from);
    if (senderSocket) {
      this.server.to(senderSocket).emit('messageStatus', {
        messageId: id,
        status: 'sent',
      });
    }

    // Gửi cho người nhận nếu đang online
    if (receiverSocket) {
      this.server.to(receiverSocket).emit('privateMessage', {
        id,
        from,
        text,
        timestamp,
      });

      // Khi người nhận nhận được tin, báo lại cho người gửi là "đã nhận"
      if (senderSocket) {
        this.server.to(senderSocket).emit('messageStatus', {
          messageId: id,
          status: 'delivered',
        });
      }
    }
  }
}
