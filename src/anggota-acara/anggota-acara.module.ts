import { Module } from '@nestjs/common';
import { AnggotaAcaraService } from './anggota-acara.service';
import { AnggotaAcaraController } from './anggota-acara.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnggotaAcara } from './entities/anggota-acara.entity';
import { Acara } from '../acara/entities/acara.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnggotaAcara, Acara, User])],
  controllers: [AnggotaAcaraController],
  providers: [AnggotaAcaraService],
})
export class AnggotaAcaraModule {}
