export class PostWithUserDto {
  id: number;
  description: string;
  imageUrl?: string | null; // ⬅️ cho phép null
  createdAt: Date;
  userId: number;
  user: {
    id: number;
    name: string;
    avatar?: string | null; // avatar cũng có thể null
  };
}

