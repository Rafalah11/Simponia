import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileAdminDto } from './create-profile_admin.dto';

export class UpdateProfileAdminDto extends PartialType(CreateProfileAdminDto) {}
