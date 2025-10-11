import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';

@Injectable()
export class AdminService {
  private prisma = new PrismaClient();

  async getReportData() {
    // Lấy tổng số user
    const totalUsers = await this.prisma.user.count();
    // Lấy tổng số friend connections
    const totalConnections = await this.prisma.friendship.count();
    // Lấy tổng số report vi phạm
    const totalReports = await this.prisma.report.count();
    // Lấy danh sách report chi tiết
    const reportDetails = await this.prisma.report.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        reason: true,
        createdAt: true,
      },
    });
    return {
      totalUsers,
      totalConnections,
      totalReports,
      reportDetails,
    };
  }
}
