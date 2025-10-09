// prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private static instance: PrismaService;

  constructor() {
    if (PrismaService.instance) {
      return PrismaService.instance;
    }

    super({
      log: ['query', 'info', 'warn', 'error'],
    });

    PrismaService.instance = this;
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
