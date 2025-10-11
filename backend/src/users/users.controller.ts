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
} from '@nestjs/common';
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
  @Get(':id/friends')
  async getFriends(
    @Param('id', ParseIntPipe) id: number,
    @Query('search') search?: string,
  ) {
    if (search) {
      return this.usersService.searchFriends(id, search);
    }
    return this.usersService.getFriendsWithStatus(id);
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

  @Post('friend-request')
  async sendFriendRequest(@Body() body: { senderId: number; receiverId: number }) {
    return this.usersService.sendFriendRequest(body.senderId, body.receiverId);
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
}