import { Module } from '@nestjs/common';
import { StatusVerifikasiService } from './status_verifikasi.service';
import { StatusVerifikasiController } from './status_verifikasi.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusVerifikasi } from './entities/status_verifikasi.entity';
import { Portofolio } from 'src/portofolio/entities/portofolio.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StatusVerifikasi, Portofolio, User])],
  controllers: [StatusVerifikasiController],
  providers: [StatusVerifikasiService],
})
export class StatusVerifikasiModule {}
