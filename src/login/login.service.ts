import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateLoginDto } from './dto/create-login.dto';
import { AuthService } from '../auth/auth.service';
import { Login } from './entities/login.entity';

@Injectable()
export class LoginService {
  constructor(private authService: AuthService) {}

  async login(createLoginDto: CreateLoginDto): Promise<Login> {
    try {
      // Validasi kredensial pengguna
      const user = await this.authService.validateUser(
        createLoginDto.nim,
        createLoginDto.password,
      );

      // Jika valid, hasilkan dan kembalikan token
      return this.authService.login(user, createLoginDto.rememberMe);
    } catch (error) {
      // Tangani pesan error spesifik
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: error.message,
          error: 'Unauthorized',
        });
      }
      // Untuk error tak terduga lainnya
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
