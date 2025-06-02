import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UserRole } from '../../user/entities/user.entity';

class UserResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  nim: string;

  @IsString()
  @IsOptional()
  name: string | null;

  @IsEnum(UserRole)
  role: UserRole;
}

class AnggotaResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  id_user: string;

  @IsString()
  nama: string;

  @IsString()
  nim: string;

  @IsString()
  jabatan: string;

  @IsString()
  status: string;

  @IsInt()
  @IsOptional()
  kerjasama?: number;

  @IsInt()
  @IsOptional()
  kedisiplinan?: number;

  @IsInt()
  @IsOptional()
  komunikasi?: number;

  @IsInt()
  @IsOptional()
  tanggung_jawab?: number;

  @IsOptional()
  nilai_rata_rata?: number;

  @IsString()
  @IsOptional()
  grade?: string;
}

export class AcaraResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  judul: string;

  @IsDate()
  tanggal: Date;

  @IsInt()
  jumlah_panitia: number;

  @IsInt()
  skor: number;

  @IsEnum(['active', 'ongoing', 'finished'])
  status: string;

  @IsString()
  @IsOptional()
  gambar?: string;

  @IsString()
  @IsOptional()
  deskripsi?: string;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;

  created_by: UserResponseDto;

  ketua_pelaksana: UserResponseDto;

  anggota: AnggotaResponseDto[];
}
