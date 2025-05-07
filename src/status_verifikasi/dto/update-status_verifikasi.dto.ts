import { PartialType } from '@nestjs/mapped-types';
import { CreateStatusVerifikasiDto } from './create-status_verifikasi.dto';

export class UpdateStatusVerifikasiDto extends PartialType(CreateStatusVerifikasiDto) {}
