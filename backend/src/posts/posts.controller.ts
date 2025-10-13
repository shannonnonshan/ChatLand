import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dto/create-post.dto';
import { EditPostDto } from './dto/edit-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // ---------------- GET /posts ----------------
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  // ---------------- GET /posts/user/:id ----------------
  @Get('user/:id')
  findByUser(@Param('id') id: string) {
    return this.postsService.findByUser(Number(id));
  }

  // ---------------- GET /posts/friends/:id ----------------
  // @Get('friends/:id')
  // findByFriends(@Param('id') id: string) {
  //   return this.postsService.findByFriends(Number(id));
  // }

  // ---------------- POST /posts/create ----------------
  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreatePostDto,
  ) {
    if (!file) throw new BadRequestException('Image is required');

    return this.postsService.create({
      userId: Number(body.userId),
      description: body.description || '',
      imageUrl: `/uploads/${file.filename}`,
    });
  }

  // ---------------- POST /posts/:id/edit ----------------
   @Post(':id/edit')
  @UseInterceptors(FileInterceptor('image'))
  async editPost(
    @Param('id') id: string,
    @Body() body: EditPostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const postId = Number(id);
    if (!postId) throw new NotFoundException('Invalid post ID');

    return this.postsService.editPost(postId, body.description, file);
  }
  // ---------------- DELETE /posts/:id/:userId ----------------
  @Delete(':id/:userId')
  async delete(@Param('id') id: string, @Param('userId') userId: string) {
    return this.postsService.delete(Number(id), Number(userId));
  }
}
