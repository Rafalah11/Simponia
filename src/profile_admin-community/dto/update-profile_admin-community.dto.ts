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
  readonly tanggalLahir?: string;

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

  @ApiProperty({ required: false })
  readonly namaKomunitas?: string;

  @ApiProperty({ required: false })
  readonly joinKomunitas?: string;

  @ApiProperty({ required: false })
  readonly divisi?: string;

  @ApiProperty({ required: false })
  readonly posisi?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  readonly profilePicture?: Express.Multer.File;
}
