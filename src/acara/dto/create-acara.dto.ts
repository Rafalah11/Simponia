import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class AnggotaDto {
  @IsUUID()
  @IsNotEmpty()
  id_user: string;

  @IsString()
  @IsNotEmpty()
  jabatan: string;

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

export class CreateAcaraDto {
  @IsUUID()
  @IsNotEmpty()
  id_user: string;

  @IsNotEmpty()
  @IsString()
  judul: string;

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
