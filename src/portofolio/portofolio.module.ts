import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortofolioService } from './portofolio.service';
import { PortofolioController } from './portofolio.controller';
import { Portofolio } from './entities/portofolio.entity';
import { PortofolioAnggota } from '../portofolio-anggota/entities/portofolio-anggota.entity/portofolio-anggota.entity';
import { DetailProject } from '../detail-project/entities/detail-project.entity/detail-project.entity';
import { Tag } from '../tags/entities/tag.entity/tag.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { ProfileUser } from 'src/profile_user/entities/profile_user.entity';
import { ProfileUserModule } from 'src/profile_user/profile_user.module';
import { ProfileAdminModule } from 'src/profile_admin/profile_admin.module';
import { ProfileAdminCommunityModule } from 'src/profile_admin-community/profile_admin-community.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Portofolio,
      PortofolioAnggota,
      DetailProject,
      Tag,
      User,
      ProfileUser,
    ]),
    ProfileUserModule, // Impor ProfileUserModule
    ProfileAdminModule, // Impor ProfileAdminModule
    ProfileAdminCommunityModule, // Impor ProfileAdminCommunityModule
    UserModule,
  ],
  controllers: [PortofolioController],
  providers: [PortofolioService, UserService],
})
export class PortofolioModule {}
