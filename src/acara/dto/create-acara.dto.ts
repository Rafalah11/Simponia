import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AnggotaDto {
  @IsUUID()
  @IsNotEmpty()
  id_user: string;

  @IsString()
  @IsNotEmpty()
  jabatan: string;
}

export class CreateAcaraDto {
  @IsUUID()
  @IsNotEmpty()
  id_user: string;

  @IsNotEmpty()
  @IsString()
  judul: string;

  @IsUUID()
  @IsNotEmpty()
  ketua_pelaksana: string;

  @IsDate()
  @Type(() => Date)
  tanggal: Date;

  @IsInt()
  @IsNotEmpty()
  jumlah_panitia: number;

  @IsInt()
  @IsNotEmpty()
  skor: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  gambar?: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnggotaDto)
  anggota?: AnggotaDto[];
}
