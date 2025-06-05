import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileUserDto {
  readonly user_id?: string;
  readonly nama?: string;
  readonly noHandphone?: string;
  readonly gender?: 'L' | 'P';
  readonly tanggalLahir?: Date;
  readonly kota?: string;
  readonly keterangan?: string;
  readonly linkedin?: string;
  readonly instagram?: string;
  readonly email?: string;
  readonly github?: string;

  @ApiProperty({ required: false })
  readonly namaKomunitas?: string;

  @ApiProperty({ required: false })
  readonly joinKomunitas?: string;

  @ApiProperty({ required: false })
  readonly divisi?: string;

  @ApiProperty({ required: false })
  readonly posisi?: string;
  readonly profilePicture?: string;
}
