export class CreateProfileAdminDto {
  readonly user_id: string;
  readonly nama: string;
  readonly noHandphone: string;
  readonly gender: 'L' | 'P';
  readonly tanggalLahir: Date;
  readonly kota: string;
  readonly keterangan?: string;
  readonly linkedin?: string;
  readonly instagram?: string;
  readonly email: string;
  readonly github?: string;
}
