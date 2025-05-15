import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  async seedUsers() {
    const usersToSeed = [
      {
        nim: '202210370311442',
        password: '12345678',
        role: UserRole.ADMIN,
      },
      {
        nim: '202210370311088',
        password: '12345678',
        role: UserRole.ADMIN_COMMUNITY,
      },
      {
        nim: '202210370311449',
        password: '12345678',
        role: UserRole.MAHASISWA,
      },
    ];

    for (const userData of usersToSeed) {
      const existingUser = await this.userRepository.findOne({
        where: { nim: userData.nim },
      });

      if (!existingUser) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        const user = this.userRepository.create({
          ...userData,
          password: hashedPassword,
        });

        await this.userRepository.save(user);
        console.log(`User ${userData.nim} seeded`);
      }
    }
  }
}
