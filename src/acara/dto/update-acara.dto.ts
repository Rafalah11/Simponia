import { PartialType } from '@nestjs/mapped-types';
import { CreateAcaraDto } from './create-acara.dto';

export class UpdateAcaraDto extends PartialType(CreateAcaraDto) {}
