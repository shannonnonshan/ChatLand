import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

@Module({
  providers: [ChatGateway], // 👈 dòng này cực kỳ quan trọng
})
export class ChatModule {}
