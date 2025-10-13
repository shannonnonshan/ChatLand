import { PrismaService } from '../prisma/prisma.service';
import { UserProfileDto } from './dto/profile.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';
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
    const { email, password, otp } = loginData;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Email không tồn tại');

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Sai mật khẩu');

    if (user.twoFactorEnabled) {
      if (!otp) {
        const generatedOtp = randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await this.prisma.user.update({
          where: { id: user.id },
          data: { otpCode: generatedOtp, otpExpiresAt: expiresAt },
        });

        // Gửi OTP email...
        return { message: 'OTP đã được gửi đến email của bạn', requiresOtp: true };
      }

      if (otp !== user.otpCode || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
        throw new UnauthorizedException('OTP không hợp lệ hoặc đã hết hạn');
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { otpCode: null, otpExpiresAt: null },
      });
    }
    const role = user.role || 'user';
    const token = await this.generateToken(user.id, user.email, role);

    return {
      message: 'Đăng nhập thành công',
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role, 
        twoFactorEnabled: user.twoFactorEnabled
      },
      token,
    };
  }



  private async generateToken(userId: number, email: string, role: string) {
    return this.jwtService.signAsync({ sub: userId, email, role });
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


  // ================== FRIEND REQUESTS ==================
  async getFriendSuggestions(userId: number, limit = 10) {
    // Lấy danh sách bạn bè hiện tại
    const friends = await this.getFriendsByUserId(userId);
    const friendIds = friends.map((f) => f.id);

    // Lấy danh sách người dùng mà chưa là bạn và chưa gửi/nhận request
    const suggestions = await this.prisma.user.findMany({
      where: {
        id: { not: userId, notIn: friendIds },
        sentRequests: { none: { receiverId: userId } },
        receivedRequests: { none: { senderId: userId } },
      },
      take: limit,
      select: { id: true, name: true, avatar: true },
      orderBy: { createdAt: 'desc' },
    });

    return suggestions;
  }

  // ================== FRIEND REQUESTS ==================
async sendFriendRequest(senderId: number, receiverId: number) {
  if (senderId === receiverId)
    throw new BadRequestException('Không thể gửi lời mời cho chính bạn');

  // 🔍 Kiểm tra xem đã có yêu cầu kết bạn nào giữa 2 người chưa
  const existing = await this.prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });
  if (existing) throw new BadRequestException('Đã tồn tại yêu cầu kết bạn');

  // 🧠 Lấy thông tin người gửi (sender)
  const sender = await this.prisma.user.findUnique({
    where: { id: senderId },
    select: { name: true },
  });

  // 📨 Tạo yêu cầu kết bạn
  const request = await this.prisma.friendRequest.create({
    data: { senderId, receiverId },
  });

  // 🔔 Tạo notification hiển thị tên sender
  await this.prisma.notification.create({
    data: {
      userId: receiverId,
      senderId,
      type: 'FRIEND_REQUEST',
      title: 'Lời mời kết bạn mới',
      content: `Bạn nhận được lời mời kết bạn từ ${sender?.name || 'một người dùng'}.`,
    },
  });

  return request;
}
async cancelFriendRequest(senderId: number, receiverId: number) {
  // 🔍 Kiểm tra xem có yêu cầu kết bạn nào giữa 2 người này không
  const existing = await this.prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (!existing) {
    throw new BadRequestException('Không tồn tại yêu cầu kết bạn để hủy');
  }

  await this.prisma.friendRequest.delete({
    where: { id: existing.id },
  });

  await this.prisma.notification.deleteMany({
    where: {
      senderId,
      userId: receiverId,
      type: 'FRIEND_REQUEST',
    },
  });

  return { message: 'Đã hủy yêu cầu kết bạn thành công' };
}
async rejectFriendRequest(requestId: number) {
  await this.prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: 'rejected' },
  });
  return { message: 'Friend request rejected' };
}
async acceptFriendRequest(requestId: number) {
  const request = await this.prisma.friendRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) throw new NotFoundException('Yêu cầu không tồn tại');

  await this.prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: 'accepted' },
  });

  await this.prisma.friendship.create({
    data: { userAId: request.senderId, userBId: request.receiverId },
  });

  // Tạo notifications cho cả sender & receiver
  await this.prisma.notification.createMany({
    data: [
      {
        userId: request.senderId,
        type: 'FRIEND_ACCEPTED',
        title: 'Yêu cầu kết bạn được chấp nhận',
        content: `Yêu cầu kết bạn của bạn đã được người dùng ${request.receiverId} chấp nhận.`,
      },
      {
        userId: request.receiverId,
        type: 'NEW_CHAT_READY',
        title: 'Bạn có thể nhắn tin',
        content: `Bạn và người dùng ${request.senderId} đã trở thành bạn bè, có thể trò chuyện ngay.`,
      },
    ],
  });

  return { message: 'Đã chấp nhận kết bạn' };
}
async getFriendRequests(userId: number) {
  return this.prisma.friendRequest.findMany({
    where: { receiverId: userId, status: 'pending' },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
  // ================== NOTIFICATIONS ==================
  async getNotifications(userId: number) {
  return this.prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
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

      if (messages.length === 0) return null;

      const msgs = messages.map((m) => ({
        id: m.id.toString(),
        fromMe: Number(m.senderId) === Number(userId),
        type: m.type as "text" | "audio" | "image",
        text: m.type === "text" ? m.content : m.type === "audio" ? "[Voice message 🎧]" : "[Image]",
        mediaUrl: m.mediaUrl || null,
        timestamp: new Date(m.createdAt).getTime(),
        status: "delivered",
        seen: m.seen,
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
    })
  );

  return conversations.filter(Boolean);
}
  async googleLogin(googleUser: any) {
    if (!googleUser) {
      throw new Error('No user from Google');
    }

    let user = await this.prisma.user.findUnique({
      where: { ggid: googleUser.ggid },
    });

    if (!user && googleUser.email) {
      user = await this.prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      // Nếu có user email đó → cập nhật thêm ggid
      if (user) {
        user = await this.prisma.user.update({
          where: { email: googleUser.email },
          data: { ggid: googleUser.ggid },
        });
      }
    }

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          ggid: googleUser.ggid,
          name: googleUser.name || 'Người dùng Google',
          email: googleUser.email ?? `${googleUser.ggid}@googleuser.fake`,
          avatar: googleUser.avatar,
          password: '', // Google login không dùng password
        },
      });
    }

    // 4️⃣ Tạo JWT token
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      user,
    };
  }
  async sendOtpEmail(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // ✅ Sinh OTP
    const otp = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    // ✅ Lưu OTP và thời gian hết hạn vào DB
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: expiresAt,
      },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ChatLand" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 ChatLand OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Xin chào ${user.name || 'bạn'} 👋</h2>
          <p>Mã xác thực (OTP) của bạn là:</p>
          <h1 style="color: #2563eb; letter-spacing: 3px;">${otp}</h1>
          <p>Mã này sẽ hết hạn sau <b>5 phút</b>.</p>
          <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
          <hr/>
          <small>ChatLand Security Team</small>
        </div>
      `,
    });

    return { message: 'OTP sent successfully' };
  }
  async updateTwoFA(userId: number, twoFactorEnabled: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled },
      select: { id: true, twoFactorEnabled: true },
    });
  }

}
