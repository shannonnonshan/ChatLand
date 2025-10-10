// prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'), // ✅ lấy từ .env
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Prisma connected to DB');
    } catch (err) {
      console.error('❌ Prisma failed to connect:', err);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      console.log('🛑 Prisma disconnected from DB');
    } catch (err) {
      console.error('❌ Prisma failed to disconnect:', err);
    }
  }
}
