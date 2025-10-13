import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  UseGuards,
  Req,
  Res,
  ForbiddenException
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UserProfileDto } from './dto/profile.dto';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Lấy tất cả user
  @Get()
  findAll(): Promise<UserProfileDto[]> {
    return this.usersService.findAll();
  }
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Req() req: any) {
    return req.user;
  }
  // Lấy 1 user
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserProfileDto> {
    return this.usersService.findOne(id);
  }

  // Đăng ký
  @Post('signup')
  async signup(@Body() signupData: SignupDto) {
    const user = await this.usersService.signup(signupData);
    return {
      message: 'Đăng ký thành công',
      user,
    };
  }

  // Đăng nhập
  @Post('login')
  async login(@Body() loginData: LoginDto) {
    const result = await this.usersService.login(loginData);
    return result;
  }

  // Cập nhật user
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: Partial<{
      name: string;
      bio: string;
      avatar: string;
      online: boolean;
      password: string;
    }>,
  ) {
    return this.usersService.update(id, body);
  }

  // Xoá user
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  /**
   * Lấy danh sách friends kèm trạng thái online
   * query search (tùy chọn)
   */
  @Get(':userId/friends')
  async getFriends(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('search') search?: string,
  ) {
    if (search) {
      return this.usersService.searchFriends(userId, search);
    }
    return this.usersService.getFriendsWithStatus(userId);
  }

  /**
   * Lấy danh sách conversations 1-1 của user
   * Trả về mảng:
   * [
   *   {
   *     friend: {id, name, avatar, online},
   *     messages: [{id, fromMe, text, timestamp, status}],
   *     lastMessage: {id, fromMe, text, timestamp, status} | undefined
   *   }
   * ]
   */
  @Get(':id/conversations')
  async getConversations(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getConversations(id);
  }
  @Post('friend-request/send')
  sendRequest(@Body() dto: { senderId: number; receiverId: number }) {
    return this.usersService.sendFriendRequest(dto.senderId, dto.receiverId);
  }
  @Post('friend-request/cancel')
  cancelRequest(@Body() dto: { senderId: number; receiverId: number }) {
    return this.usersService.cancelFriendRequest(dto.senderId, dto.receiverId);
  }

  @Get('friend-requests/:userId')
  async getFriendRequests(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersService.getFriendRequests(userId);
  }

  @Patch('friend-request/:id/accept')
  async acceptFriendRequest(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.acceptFriendRequest(id);
  }

  @Patch('friend-request/:id/reject')
  async rejectFriendRequest(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.rejectFriendRequest(id);
  }
  @Get(':userId/notifications')
  getNotifications(@Param('userId') userId: number) {
    return this.usersService.getNotifications(Number(userId));
  }

  @Get('friend-suggestions/:userId')
  async getFriendSuggestions(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const limit = 10; // có thể cố định hoặc lấy thêm param khác
    return this.usersService.getFriendSuggestions(userId, limit);
  } 
  @Get('login/googleAuth')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
  }

  @Get('login/googleAuth/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const googleUser = req.user as any;

    const result = await this.usersService.googleLogin(googleUser);

    // ✅ result có: { access_token, user }
    return res.redirect(
      `http://localhost:3000/oauth/success?token=${result.access_token}`,
    );
  }
   @Patch(':id/2fa')
  @UseGuards(AuthGuard('jwt'))
  async updateTwoFA(
    @Param('id', ParseIntPipe) id: number,
    @Body('twoFactorEnabled') twoFactorEnabled: boolean, // phải giống frontend
    @Req() req: any, // để lấy thông tin user từ JWT
  ) {
    // Kiểm tra quyền: chỉ user chính chủ mới được chỉnh 2FA
    if (req.user.id !== id) {
      throw new ForbiddenException("Bạn không được phép chỉnh sửa 2FA của user khác");
    }

    // Cập nhật DB và trả về giá trị mới
    return this.usersService.updateTwoFA(id, twoFactorEnabled);
  }
}
