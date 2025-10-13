import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { FriendModule } from './friend.module';
import { PrismaService } from './prisma.service';
@Module({
  imports: [FriendModule],
  controllers: [AppController, AdminController],
  providers: [AppService, AdminService, PrismaService],
})
export class AppModule {}
