import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class SearchUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  currentUserId: number;
}