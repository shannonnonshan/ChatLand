import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from '../prisma/prisma.module'; // 👈 thêm dòng này

@Module({
  imports: [PrismaModule], // 👌 giờ hợp lệ
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
