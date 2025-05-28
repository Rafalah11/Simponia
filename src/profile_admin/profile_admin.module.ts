import { forwardRef, Module } from '@nestjs/common';
import { ProfileAdminService } from './profile_admin.service';
import { ProfileAdminController } from './profile_admin.controller';
import { ProfileAdmin } from './entities/profile_admin.entity';
import { User } from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileAdmin, User]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ProfileAdminController],
  providers: [ProfileAdminService],
  exports: [TypeOrmModule, ProfileAdminService],
})
export class ProfileAdminModule {}
