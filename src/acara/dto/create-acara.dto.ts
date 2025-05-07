import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAcaraDto {
  @IsUUID()
  id_user: string;

  @IsNotEmpty()
  @IsString()
  judul: string;

  @IsUUID()
  ketua_pelaksana: string;

  @IsDate()
  tanggal: Date;

  @IsInt()
  jumlah_panitia: number;

  @IsNotEmpty()
  @IsString()
  status?: string;

  @IsNotEmpty()
  @IsString()
  gambar?: string;

  @IsNotEmpty()
  @IsString()
  deskripsi?: string;
}
