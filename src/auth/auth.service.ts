import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService, // Pastikan ini di-inject
    private jwtService: JwtService,
  ) {}

  async validateUser(nim: string, pass: string): Promise<any> {
    const user = await this.userService.findByNim(nim);
    if (!user) {
      throw new UnauthorizedException('NIM tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Password salah');
    }

    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      sub: user.id, // sub -> s (user ID)
      nim: user.nim, // nim -> n
      role: user.role, // role -> r
    };
    return {
      access_token: this.jwtService.sign(payload),
      message: 'Login berhasil',
    };
  }
}
