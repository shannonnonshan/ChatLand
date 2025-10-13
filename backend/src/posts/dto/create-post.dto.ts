import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePostDto {
  @IsNumber()
  @Type(() => Number)  // thêm cái này
  userId: number;

  @IsOptional()
  @IsString()
  description?: string;
}
