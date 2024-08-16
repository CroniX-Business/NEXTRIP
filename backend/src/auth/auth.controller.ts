import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Headers,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ token: string }> {
    try {
      const token = await this.authService.register(username, email, password);
      return { token };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('User already exists');
      }
      throw new HttpException(
        'User registration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ token: string } | { error: string }> {
    const token = await this.authService.login(email, password);
    if (token) {
      return { token };
    } else {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('userInfo')
  async userInfo(@Headers('authorization') authHeader: string): Promise<User> {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await this.authService.getUserFromToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }
}
