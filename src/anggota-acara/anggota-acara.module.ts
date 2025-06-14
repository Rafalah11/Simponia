import { Module } from '@nestjs/common';
import { AnggotaAcaraService } from './anggota-acara.service';
import { AnggotaAcaraController } from './anggota-acara.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnggotaAcara } from './entities/anggota-acara.entity';
import { Acara } from '../acara/entities/acara.entity';
import { User } from '../user/entities/user.entity';
import { ProfileUserModule } from 'src/profile_user/profile_user.module';
import { ProfileAdminModule } from 'src/profile_admin/profile_admin.module';
import { ProfileAdminCommunityModule } from 'src/profile_admin-community/profile_admin-community.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnggotaAcara, Acara, User]),
    ProfileUserModule,
    ProfileAdminModule,
    ProfileAdminCommunityModule,
  ],
  controllers: [AnggotaAcaraController],
  providers: [AnggotaAcaraService],
})
export class AnggotaAcaraModule {}
