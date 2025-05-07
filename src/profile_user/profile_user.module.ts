import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileUserService } from './profile_user.service';
import { ProfileUserController } from './profile_user.controller';
import { ProfileUser } from './entities/profile_user.entity';
import { User } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileUser, User]),
    AuthModule, // Tambahkan AuthModule
  ],
  controllers: [ProfileUserController],
  providers: [ProfileUserService],
})
export class ProfileUserModule {}
