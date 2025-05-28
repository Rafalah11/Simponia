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

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  profilePicture?: Express.Multer.File;
}
