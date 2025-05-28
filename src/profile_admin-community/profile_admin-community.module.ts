import { Module } from '@nestjs/common';
import { ProfileAdminCommunityService } from './profile_admin-community.service';
import { ProfileAdminCommunityController } from './profile_admin-community.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileAdminCommunity } from './entities/profile_admin-community.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileAdminCommunity, User])],
  controllers: [ProfileAdminCommunityController],
  providers: [ProfileAdminCommunityService],
  exports: [TypeOrmModule, ProfileAdminCommunityService],
})
export class ProfileAdminCommunityModule {}
