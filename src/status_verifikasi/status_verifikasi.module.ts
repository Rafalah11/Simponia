import { Module } from '@nestjs/common';
import { StatusVerifikasiService } from './status_verifikasi.service';
import { StatusVerifikasiController } from './status_verifikasi.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusVerifikasi } from './entities/status_verifikasi.entity';
import { Portofolio } from 'src/portofolio/entities/portofolio.entity';
import { User } from 'src/user/entities/user.entity';
import { ProfileUserModule } from 'src/profile_user/profile_user.module';
import { PortofolioAnggota } from 'src/portofolio-anggota/entities/portofolio-anggota.entity/portofolio-anggota.entity';
import { PortofolioModule } from 'src/portofolio/portofolio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StatusVerifikasi,
      Portofolio,
      User,
      PortofolioAnggota,
    ]),
    ProfileUserModule,
    PortofolioModule,
  ],
  controllers: [StatusVerifikasiController],
  providers: [StatusVerifikasiService],
})
export class StatusVerifikasiModule {}
