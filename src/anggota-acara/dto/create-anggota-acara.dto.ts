import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateAnggotaAcaraDto {
  @IsUUID()
  @IsNotEmpty()
  id_acara: string;

  @IsUUID()
  @IsNotEmpty()
  id_user: string;

  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsString()
  @IsNotEmpty()
  nim: string;

  @IsString()
  @IsNotEmpty()
  jabatan: string;
  static anggota: any;

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

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  catatan?: string;
}
