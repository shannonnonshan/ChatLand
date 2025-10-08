import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserProfileDto } from './dto/profile.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { JwtUserPayload } from './dto/jwt.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Lấy tất cả user với friends
  async findAll(): Promise<UserProfileDto[]> {
    const users = await this.prisma.user.findMany({
      include: {
        posts: { orderBy: { createdAt: 'desc' } },
        friendshipsA: {
          include: {
            userB: { select: { id: true, name: true, avatar: true } },
          },
        },
        friendshipsB: {
          include: {
            userA: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => {
      const friends = [
        ...user.friendshipsA.map((f) => f.userB),
        ...user.friendshipsB.map((f) => f.userA),
      ];
      const uniqueFriends = Array.from(
        new Map(friends.map((f) => [f.id, f])).values(),
      );
      const { friendshipsA, friendshipsB, password, ...userData } = user;
      return { ...userData, friends: uniqueFriends };
    });
  }

  // Lấy 1 user cụ thể
  async findOne(id: number): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        posts: { orderBy: { createdAt: 'desc' } },
        friendshipsA: {
          include: {
            userB: { select: { id: true, name: true, avatar: true } },
          },
        },
        friendshipsB: {
          include: {
            userA: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const friends = [
      ...user.friendshipsA.map((f) => f.userB),
      ...user.friendshipsB.map((f) => f.userA),
    ];
    const uniqueFriends = Array.from(
      new Map(friends.map((f) => [f.id, f])).values(),
    );
    const { friendshipsA, friendshipsB, password, ...userData } = user;

    return { ...userData, friends: uniqueFriends };
  }

  // Tạo user mới
  async create(data: {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    bio?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });
  }

  // Cập nhật user
  async update(
    id: number,
    data: Partial<{
      name: string;
      bio: string;
      avatar: string;
      online: boolean;
      password: string;
    }>,
  ) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.update({ where: { id }, data });
  }

  // Xóa user
  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  // Validate user login
  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<JwtUserPayload, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    // Loại bỏ password khỏi object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Tạo JWT
  generateJwt(user: Omit<JwtUserPayload, 'password'>): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload) as Promise<string>;
  }
}
