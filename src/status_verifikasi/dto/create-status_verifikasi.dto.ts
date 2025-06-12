import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateStatusVerifikasiDto {
  @IsString()
  @IsNotEmpty()
  id_portofolio: string;

  @IsString()
  @IsIn([
    'Belum di Verifikasi',
    'Proses Verifikasi',
    'Perlu Perubahan',
    'Terverifikasi',
    'Dihapus',
  ])
  status: string;

  @IsString()
  @IsNotEmpty()
  updated_by: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsNotEmpty()
  profile_user: string;
}
