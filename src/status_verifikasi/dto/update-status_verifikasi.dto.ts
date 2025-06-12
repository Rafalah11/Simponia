import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateStatusVerifikasiDto {
  @IsString()
  @IsOptional()
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
  updated_by?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  profile_user?: string;
}
