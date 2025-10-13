import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class FriendService {
  constructor(private prisma: PrismaService) {}

  // Hàm tìm danh sách bạn bè của 1 user, có thể kèm search
  async findFriends(userId: number, search?: string) {
    // Tìm các record Friendship có liên quan tới userId
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    });

    // Lấy danh sách ID bạn bè
    const friendIds = friendships.map(f =>
      f.userAId === userId ? f.userBId : f.userAId
    );

    // Nếu chưa có bạn bè thì trả về mảng rỗng
    if (friendIds.length === 0) return [];

    // Tìm thông tin bạn bè trong bảng User
    return this.prisma.user.findMany({
      where: {
        id: { in: friendIds },
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        online: true,
        lastSeen: true,
      },
    });
  }
}
