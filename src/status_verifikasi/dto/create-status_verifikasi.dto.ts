import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Portofolio } from '../../portofolio/entities/portofolio.entity';

export class CreateStatusVerifikasiDto {
  @IsInt()
  id_portofolio: string;

  status: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsInt()
  updated_by: string;
}
