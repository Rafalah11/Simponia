import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcaraService } from './acara.service';
import { AcaraController } from './acara.controller';
import { Acara } from './entities/acara.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Acara, User])],
  controllers: [AcaraController],
  providers: [AcaraService],
})
export class AcaraModule {}
