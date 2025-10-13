import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';

@Injectable()
export class AdminService {
  private prisma = new PrismaClient();

  async getReportData() {
    // Tổng số user
    const totalUsers = await this.prisma.user.count();

    // Ngày 3 ngày trước
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Số lượng user mới trong 3 ngày gần đây
    const newUsersInLast3Days = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: threeDaysAgo, // greater than or equal
        },
      },
    });

    // Tổng số kết nối bạn bè (tuỳ chọn nếu muốn hiển thị)
    const totalConnections = await this.prisma.friendship.count();

    return {
      totalUsers,
      newUsersInLast3Days,
      totalConnections,
    };
  }
}
