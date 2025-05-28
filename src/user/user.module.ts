import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { ProfileUserModule } from '../profile_user/profile_user.module';
import { ProfileAdminModule } from '../profile_admin/profile_admin.module';
import { ProfileAdminCommunityModule } from '../profile_admin-community/profile_admin-community.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ProfileUserModule, // Impor untuk ProfileUserRepository
    forwardRef(() => ProfileAdminModule), // Impor untuk ProfileAdminRepository
    ProfileAdminCommunityModule, // Impor untuk ProfileAdminCommunityRepository
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
