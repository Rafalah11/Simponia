import { Module } from '@nestjs/common';
import { ProfileUserService } from './profile_user.service';
import { ProfileUserController } from './profile_user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileUser } from './entities/profile_user.entity';
import { User } from '../user/entities/user.entity';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileUser, User])],
  controllers: [ProfileUserController],
  providers: [ProfileUserService],
  exports: [TypeOrmModule, ProfileUserService],
})
export class ProfileUserModule {}
