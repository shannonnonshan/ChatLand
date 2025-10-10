import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // GET /posts
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  // GET /posts/user/1
  @Get('user/:id')
  findByUser(@Param('id') id: string) {
    return this.postsService.findByUser(Number(id));
  }

  // POST /posts
  @Post()
  create(
    @Body() body: { userId: number; description: string; imageUrl?: string },
  ) {
    return this.postsService.create(body);
  }

  // DELETE /posts/5
  @Delete(':id/:userId')
  delete(@Param('id') id: string, @Param('userId') userId: string) {
    return this.postsService.delete(Number(id), Number(userId));
  }
}
