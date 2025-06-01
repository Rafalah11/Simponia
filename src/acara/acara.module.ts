import { Module } from '@nestjs/common';
import { AcaraService } from './acara.service';
import { AcaraController } from './acara.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Acara } from './entities/acara.entity';
import { User } from '../user/entities/user.entity';
import { AnggotaAcara } from '../anggota-acara/entities/anggota-acara.entity';
import { ProfileUser } from '../profile_user/entities/profile_user.entity';
import { ProfileAdmin } from '../profile_admin/entities/profile_admin.entity';
import { ProfileAdminCommunity } from '../profile_admin-community/entities/profile_admin-community.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Acara,
      User,
      AnggotaAcara,
      ProfileUser,
      ProfileAdmin,
      ProfileAdminCommunity,
    ]),
  ],
  controllers: [AcaraController],
  providers: [AcaraService],
})
export class AcaraModule {}
