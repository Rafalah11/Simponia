import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

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
}
