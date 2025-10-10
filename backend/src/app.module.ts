import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 👈 để module nào cũng dùng được biến môi trường
    }),
    ChatModule,
  , PostsModule, UsersModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
