import { Controller, Get, Query } from '@nestjs/common';
import { FriendService } from './friend.service';

@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  // Tạm thời giả định userId = 1 (sau này có thể lấy từ JWT)
  @Get()
  async getFriends(@Query('search') search?: string) {
    const userId = 1;
    return this.friendService.findFriends(userId, search);
  }
}
