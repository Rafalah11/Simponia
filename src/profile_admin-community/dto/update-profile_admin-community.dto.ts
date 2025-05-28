// src/profile_admin-community/dto/update-profile_admin-community.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileAdminCommunityDto {
  @ApiProperty({ required: false })
  readonly user_id?: string;

  @ApiProperty({ required: false })
  readonly nama?: string;

  @ApiProperty({ required: false })
  readonly noHandphone?: string;

  @ApiProperty({ enum: ['L', 'P'], required: false })
  readonly gender?: 'L' | 'P';

  @ApiProperty({ required: false })
  readonly tanggalLahir?: string | Date;

  @ApiProperty({ required: false })
  readonly kota?: string;

  @ApiProperty({ required: false })
  readonly keterangan?: string;

  @ApiProperty({ required: false })
  readonly linkedin?: string;

  @ApiProperty({ required: false })
  readonly instagram?: string;

  @ApiProperty({ required: false })
  readonly email?: string;

  @ApiProperty({ required: false })
  readonly github?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  readonly profilePicture?: Express.Multer.File;
}
