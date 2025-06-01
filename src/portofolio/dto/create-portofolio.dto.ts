import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreatePortofolioAnggotaDto {
  @IsNotEmpty()
  @IsString()
  id_user: string;

  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  @IsString()
  angkatan: string;
}

class CreateDetailProjectDto {
  @IsNotEmpty()
  @IsString()
  judul_link: string;

  @IsNotEmpty()
  @IsString()
  link_project: string;
}

class CreateTagDto {
  @IsNotEmpty()
  @IsString()
  nama: string;
}

export class CreatePortofolioDto {
  @IsOptional()
  @IsString()
  nama_projek: string;

  @IsNotEmpty()
  @IsString()
  kategori: string;

  @IsNotEmpty()
  @IsNumber()
  tahun: number;

  @IsOptional()
  @IsString()
  @IsIn([
    'Belum di Verifikasi',
    'Proses Verifikasi',
    'Perlu Perubahan',
    'Terverifikasi',
    'Dihapus',
  ])
  status?: string;

  @IsString()
  @IsOptional()
  gambar?: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePortofolioAnggotaDto)
  anggota?: CreatePortofolioAnggotaDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetailProjectDto)
  detail_project?: CreateDetailProjectDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTagDto)
  tags?: CreateTagDto[];
}
