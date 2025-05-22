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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Portofolio,
      PortofolioAnggota,
      DetailProject,
      Tag,
      User,
    ]),
  ],
  controllers: [PortofolioController],
  providers: [PortofolioService, UserService],
})
export class PortofolioModule {}
