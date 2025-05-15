import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(nim: string, pass: string): Promise<any> {
    const user = await this.userService.findByNim(nim);
    if (!user) {
      throw new UnauthorizedException('NIM / Password Salah');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('NIM / Password salah');
    }

    const { password, ...result } = user;
    return result;
  }

  async login(user: any, rememberMe: boolean = false) {
    const payload = {
      sub: user.id, // sub -> user ID
      nim: user.nim,
      role: user.role,
    };
    const expiresIn = rememberMe ? '30d' : '1h'; // 30 hari jika rememberMe, 1 jam jika tidak
    return {
      access_token: this.jwtService.sign(payload, { expiresIn }),
      role: user.role,
      message: 'Login berhasil',
    };
  }
}
