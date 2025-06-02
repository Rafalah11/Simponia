import { PartialType } from '@nestjs/mapped-types';
import { CreateAnggotaAcaraDto } from './create-anggota-acara.dto';

import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class UpdateAnggotaAcaraDto {
  @IsString()
  @IsOptional()
  id_acara?: string;

  @IsString()
  @IsOptional()
  id_user?: string;

  @IsString()
  @IsOptional()
  nama?: string;

  @IsString()
  @IsOptional()
  nim?: string;

  @IsString()
  @IsOptional()
  jabatan?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  kerjasama?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  kedisiplinan?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  komunikasi?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  tanggung_jawab?: number;
}
