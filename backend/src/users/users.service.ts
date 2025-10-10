import { PrismaService } from '../prisma/prisma.service';
import { UserProfileDto } from './dto/profile.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

type Message = {
  id: string;
  fromMe: boolean;
  text: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
};

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ================== USER ==================
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        ...user.friendshipsA.map((f) => f.userB),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        ...user.friendshipsB.map((f) => f.userA),
      ];
      const uniqueFriends = Array.from(
        new Map(friends.map((f) => [f.id, f])).values(),
      );
      return { ...user, friends: uniqueFriends };
    });
  }

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
    return { ...user, friends: uniqueFriends };
  }

  async signup(signupData: SignupDto) {
    const { email, password, name } = signupData;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser)
      throw new BadRequestException('Email này đã được đăng ký');

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: { email, name, password: hashedPassword },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  }

  async login(loginData: LoginDto) {
    const { email, password } = loginData;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Email không tồn tại');

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Sai mật khẩu');

    const token = await this.generateToken(user.id, user.email);
    return {
      message: 'Đăng nhập thành công',
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  private async generateToken(userId: number, email: string) {
    return this.jwtService.signAsync({ sub: userId, email });
  }

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
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  // ================== FRIENDS ==================
  async getFriendsByUserId(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
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
    return Array.from(new Map(friends.map((f) => [f.id, f])).values());
  }

  async getFriendsWithStatus(userId: number) {
    const friends = await this.getFriendsByUserId(userId);
    return friends.map((f) => ({
      id: f.id.toString(),
      name: f.name,
      avatar: f.avatar || '/logo.png',
      online: false,
      messages: [] as Message[],
      lastMessage: undefined,
    }));
  }

  async searchFriends(userId: number, search = '', page = 1, limit = 10) {
    const friends = await this.getFriendsByUserId(userId);
    const filtered = friends.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase()),
    );
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      total: filtered.length,
      page,
      limit,
      data: paginated.map((f) => ({
        id: f.id.toString(),
        name: f.name,
        avatar: f.avatar || '/logo.png',
        online: false,
        messages: [] as Message[],
        lastMessage: undefined,
      })),
    };
  }

  // ================== CONVERSATIONS ==================
  /**
   * Lấy danh sách conversation 1-1 của user hiện tại
   */
  async getConversations(userId: number) {
    const friends = await this.getFriendsByUserId(userId);

    const conversations = await Promise.all(
      friends.map(async (f) => {
        const messages = await this.prisma.message.findMany({
          where: {
            OR: [
              { senderId: userId, receiverId: f.id },
              { senderId: f.id, receiverId: userId },
            ],
          },
          include: { sender: true },
          orderBy: { createdAt: 'asc' },
        });

        if (messages.length === 0) return null; // 🔹 loại bỏ friend chưa nhắn

        const msgs = messages.map((m) => ({
          id: m.id.toString(),
          fromMe: m.senderId === userId,
          text: m.content,
          timestamp: m.createdAt.getTime(),
          status: 'delivered',
        }));

        return {
          friend: {
            id: f.id.toString(),
            name: f.name,
            avatar: f.avatar || '',
            online: false,
          },
          messages: msgs,
          lastMessage: msgs[msgs.length - 1],
        };
      }),
    );

    // loại bỏ null và sort theo lastMessage
    return conversations
      .filter((c) => c !== null)
      .sort(
        (a, b) =>
          (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0),
      ) as {
      friend: { id: string; name: string; avatar: string; online: boolean };
      messages: Message[];
      lastMessage: Message | undefined;
    }[];
  }
}
