import { IsString, IsDate, IsOptional, IsInt, IsEnum } from 'class-validator';
import { UserRole } from '../../user/entities/user.entity';

class AcaraResponse {
  @IsString()
  id: string;

  // @IsString()
  // judul: string;

  // @IsDate()
  // tanggal: Date;

  // @IsInt()
  // jumlah_panitia: number;

  // @IsInt()
  // skor: number;

  // @IsString()
  // status: string;

  // @IsString()
  // @IsOptional()
  // gambar?: string;

  // @IsString()
  // @IsOptional()
  // deskripsi?: string;

  // @IsDate()
  // created_at: Date;

  // @IsDate()
  // updated_at: Date;
}

class CreatedByResponse {
  @IsString()
  id: string;

  @IsString()
  nim: string;

  @IsEnum(UserRole)
  role: UserRole;
}

export class AnggotaAcaraResponseDto {
  @IsString()
  id: string;

  acara: AcaraResponse;

  created_by: CreatedByResponse;

  @IsString()
  @IsOptional()
  nama?: string;

  @IsString()
  @IsOptional()
  nim?: string;

  @IsString()
  jabatan: string;

  @IsString()
  status: string;

  kerjasama?: number;
  kedisiplinan?: number;
  komunikasi?: number;
  tanggung_jawab?: number;
  nilai_rata_rata?: number;
  @IsString()
  @IsOptional()
  grade?: string;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;
}
export class DeleteAnggotaAcaraResponseDto {
  @IsString()
  message: string;
}
