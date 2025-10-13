import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { subHours, startOfHour } from 'date-fns';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(adminId: number) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'admin') return null;

    const now = new Date();
    const hoursData = [];

    for (let i = 23; i >= 0; i--) {
      const start = startOfHour(subHours(now, i));
      const end = startOfHour(subHours(now, i - 1));
      const count = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: start,
            lt: i === 0 ? now : end,
          },
        },
      });
      hoursData.push({ hour: start.getHours(), count });
    }

    const totalPosts = await this.prisma.post.count();

    return {
      adminId: admin.id,
      adminName: admin.name,
      newUsersInLast24h: hoursData.reduce((sum, h) => sum + h.count, 0),
      totalPosts,
      hourlyNewUsers: hoursData, // mảng cho chart
    };
  }
}
