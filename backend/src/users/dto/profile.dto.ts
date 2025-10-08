// src/users/dto/user-profile.dto.ts
export class FriendDto {
  id: number;
  name: string;
  avatar?: string | null;
}

export class PostDto {
  id: number;
  description: string;
  imageUrl?: string | null;
  createdAt: Date;
}

export class UserProfileDto {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  posts: PostDto[];
  friends: FriendDto[];
}
