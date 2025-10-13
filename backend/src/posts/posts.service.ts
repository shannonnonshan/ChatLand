// posts.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, PostWithUserDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  // 🟢 Lấy tất cả bài viết
  async findAll(): Promise<PostWithUserDto[]> {
    const posts = await this.prisma.post.findMany({
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return posts.map((p) => ({
      id: p.id,
      description: p.description,
      imageUrl: p.imageUrl, // null vẫn ok
      createdAt: p.createdAt,
      userId: p.userId,
      user: {
        id: p.user.id,
        name: p.user.name,
        avatar: p.user.avatar, // null vẫn ok
      },
    }));
  }

  // 🟢 Lấy tất cả bài viết của 1 user
  async findByUser(userId: number): Promise<PostWithUserDto[]> {
    const posts = await this.prisma.post.findMany({
      where: { userId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return posts.map((p) => ({
      id: p.id,
      description: p.description,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
      userId: p.userId,
      user: {
        id: p.user.id,
        name: p.user.name,
        avatar: p.user.avatar,
      },
    }));
  }

  // 🟢 Tạo bài viết mới
  async create(data: CreatePostDto): Promise<PostWithUserDto> {
    const post = await this.prisma.post.create({
      data,
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    return {
      id: post.id,
      description: post.description,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      userId: post.userId,
      user: {
        id: post.user.id,
        name: post.user.name,
        avatar: post.user.avatar,
      },
    };
  }

  // 🟢 Xóa bài viết (chỉ cho phép chủ post xóa)
  async delete(id: number, userId: number): Promise<PostWithUserDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId)
      throw new ForbiddenException('You are not allowed to delete this post');

    const deletedPost = await this.prisma.post.delete({ where: { id } });

    return {
      id: deletedPost.id,
      description: deletedPost.description,
      imageUrl: deletedPost.imageUrl,
      createdAt: deletedPost.createdAt,
      userId: deletedPost.userId,
      user: {
        id: post.user.id,
        name: post.user.name,
        avatar: post.user.avatar,
      },
    };
  }
}
