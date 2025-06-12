import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileUserDto {
  readonly user_id?: string;

  @ApiProperty()
  readonly nama: string;

  @ApiProperty()
  readonly noHandphone: string;

  @ApiProperty({ enum: ['L', 'P'] })
  readonly gender: 'L' | 'P';

  @ApiProperty()
  readonly tanggalLahir: string | Date;

  @ApiProperty()
  readonly kota: string;

  @ApiProperty({ required: false })
  readonly keterangan?: string;

  @ApiProperty({ required: false })
  readonly linkedin?: string;

  @ApiProperty({ required: false })
  readonly instagram?: string;

  @ApiProperty()
  readonly email: string;

  @ApiProperty({ required: false })
  readonly github?: string;

  @ApiProperty({ required: false })
  readonly namaKomunitas?: string;

  @ApiProperty({ required: false })
  readonly joinKomunitas?: string; // String for form-data

  @ApiProperty({ required: false })
  readonly divisi?: string;

  @ApiProperty({ required: false })
  readonly posisi?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  profilePicture?: Express.Multer.File;

  @ApiProperty({ required: false })
  readonly verifiedPortfolioCount?: number;
}
