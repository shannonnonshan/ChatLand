import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostWithUserDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  // 🟢 Lấy tất cả bài viết
  async findAll(): Promise<PostWithUserDto[]> {
    const posts = await this.prisma.post.findMany({
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return posts.map((p) => this.toDto(p));
  }

  // 🟢 Lấy tất cả bài viết của 1 user
  async findByUser(userId: number): Promise<PostWithUserDto[]> {
    const posts = await this.prisma.post.findMany({
      where: { userId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return posts.map((p) => this.toDto(p));
  }

  // 🟢 Lấy bài viết theo id
  async findById(id: number): Promise<PostWithUserDto | null> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    if (!post) return null;
    return this.toDto(post);
  }

  // 🟢 Tạo bài viết mới
  async create(data: { userId: number; description?: string; imageUrl: string }): Promise<PostWithUserDto> {
    const post = await this.prisma.post.create({
      data: {
        userId: data.userId,
        description: data.description || '',
        imageUrl: data.imageUrl,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    return this.toDto(post);
  }

  // 🟢 Cập nhật bài viết (chỉ chủ post)
  async update(
    id: number,
    data: { description?: string; imageUrl?: string },
  ): Promise<PostWithUserDto> {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data,
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    return this.toDto(updatedPost);
  }

  // 🟢 Xóa bài viết (chỉ chủ post)
  async delete(id: number, userId: number): Promise<PostWithUserDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId)
      throw new ForbiddenException('You are not allowed to delete this post');

    const deletedPost = await this.prisma.post.delete({ where: { id } });
    return this.toDto(deletedPost, post.user);
  }

  // 🟢 Lấy bài viết của bạn bè
  // async findByFriends(userId: number): Promise<PostWithUserDto[]> {
  //   // Lấy danh sách bạn bè của user
  //   const friends = await this.prisma.friend.findMany({
  //     where: {
  //       OR: [
  //         { senderId: userId, status: 'accepted' },
  //         { receiverId: userId, status: 'accepted' },
  //       ],
  //     },
  //   });

  //   const friendIds = friends.map(f =>
  //     f.senderId === userId ? f.receiverId : f.senderId
  //   );

  //   if (friendIds.length === 0) return [];

  //   const posts = await this.prisma.post.findMany({
  //     where: { userId: { in: friendIds } },
  //     include: { user: { select: { id: true, name: true, avatar: true } } },
  //     orderBy: { createdAt: 'desc' },
  //   });

  //   return posts.map((p) => this.toDto(p));
  // }

  // ---------------- Helper ----------------
  private toDto(post: any, user?: any): PostWithUserDto {
    const postUser = user || post.user;
    return {
      id: post.id,
      description: post.description,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      userId: post.userId,
      user: {
        id: postUser.id,
        name: postUser.name,
        avatar: postUser.avatar,
      },
    };
  }
  async editPost(postId: number, description?: string, file?: Express.Multer.File) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const dataToUpdate: any = {};
    if (description !== undefined) dataToUpdate.description = description;
    if (file) dataToUpdate.imageUrl = `/uploads/${file.filename}`;

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: dataToUpdate,
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    return {
      id: updatedPost.id,
      description: updatedPost.description,
      imageUrl: updatedPost.imageUrl,
      createdAt: updatedPost.createdAt,
      userId: updatedPost.userId,
      user: {
        id: updatedPost.user.id,
        name: updatedPost.user.name,
        avatar: updatedPost.user.avatar,
      },
    };
  }
}
