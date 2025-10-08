import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Patch,
  Delete,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserProfileDto } from './dto/profile.dto';
// users.service.ts
import { JwtUserPayload } from './dto/jwt.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<UserProfileDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserProfileDto> {
    return this.usersService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      avatar?: string;
      bio?: string;
    },
  ) {
    return this.usersService.create(body);
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
  ): Promise<{ user: Omit<JwtUserPayload, 'password'>; token: string }> {
    const user = await this.usersService.validateUser(
      body.email,
      body.password,
    );
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const token = await this.usersService.generateJwt(user);
    console.log('Dang fetch backend voi:', token);
    return { user, token };
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: Partial<{
      name: string;
      bio: string;
      avatar: string;
      online: boolean;
      password: string;
    }>,
  ) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
