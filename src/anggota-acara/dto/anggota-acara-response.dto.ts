import { IsString, IsDate, IsOptional, IsInt, IsEnum } from 'class-validator';
import { UserRole } from '../../user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileIdDto {
  @ApiProperty()
  id: string;
}

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
  id_user?: string;

  // @ApiProperty({ type: () => ProfileIdDto, nullable: true })
  // profile_id: ProfileIdDto | null;

  @ApiProperty()
  @IsString()
  nama: string;

  @ApiProperty()
  @IsString()
  nim: string;

  @ApiProperty({ enum: ['L', 'P'] })
  @IsString()
  gender: 'L' | 'P';

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nama_komunitas?: string;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  join_komunitas?: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  divisi?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  posisi?: string;

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

  @IsInt()
  @IsOptional()
  nilai_rata_rata?: number;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  catatan?: string;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;
}
export class DeleteAnggotaAcaraResponseDto {
  @IsString()
  message: string;
}
