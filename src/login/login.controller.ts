import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CreateLoginDto } from './dto/create-login.dto';
import { Login } from './entities/login.entity';

@Controller('login')
export class LoginController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(@Body() createLoginDto: CreateLoginDto): Promise<Login> {
    try {
      const user = await this.authService.validateUser(
        createLoginDto.nim,
        createLoginDto.password,
      );
      return this.authService.login(user);
    } catch (error) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: error.message,
        error: 'Unauthorized',
      });
    }
  }
}
