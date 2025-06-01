import { PartialType } from '@nestjs/mapped-types';
import { CreateAnggotaAcaraDto } from './create-anggota-acara.dto';

export class UpdateAnggotaAcaraDto extends PartialType(CreateAnggotaAcaraDto) {}
