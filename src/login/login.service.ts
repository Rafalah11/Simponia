import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateLoginDto } from './dto/create-login.dto';
import { AuthService } from '../auth/auth.service';
import { Login } from './entities/login.entity';

@Injectable()
export class LoginService {
  constructor(private authService: AuthService) {}

  async login(createLoginDto: CreateLoginDto): Promise<Login> {
    try {
      // Validate user credentials
      const user = await this.authService.validateUser(
        createLoginDto.nim,
        createLoginDto.password,
      );

      // If valid, generate and return token
      return this.authService.login(user);
    } catch (error) {
      // Handle specific error messages
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: error.message,
          error: 'Unauthorized',
        });
      }
      // For other unexpected errors
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Login failed',
        error: 'Unauthorized',
      });
    }
  }

  // Remove these if not needed (they're for CRUD operations which login doesn't need)
  findAll() {
    return `This action returns all login`;
  }

  findOne(id: number) {
    return `This action returns a #${id} login`;
  }

  remove(id: number) {
    return `This action removes a #${id} login`;
  }
}
