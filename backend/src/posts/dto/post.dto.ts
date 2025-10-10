export class PostWithUserDto {
  id: number;
  description: string;
  imageUrl?: string | null;
  createdAt: Date;
  userId: number;
  user: {
    id: number;
    name: string;
    avatar?: string | null;
  };
}

export class CreatePostDto {
  description: string;
  imageUrl?: string;
  userId: number;
}
