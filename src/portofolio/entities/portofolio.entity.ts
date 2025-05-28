import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { PortofolioAnggota } from '../../portofolio-anggota/entities/portofolio-anggota.entity/portofolio-anggota.entity';
import { DetailProject } from '../../detail-project/entities/detail-project.entity/detail-project.entity';
import { Tag } from '../../tags/entities/tag.entity/tag.entity';

@Entity()
export class Portofolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  nama_projek: string;

  @Column({ length: 255 })
  kategori: string;

  @Column()
  tahun: number;

  @Column({
    type: 'enum',
    enum: [
      'Belum di Verifikasi',
      'Proses Verifikasi',
      'Perlu Perubahan',
      'Terverifikasi',
      'Dihapus',
    ],
    default: 'Belum di Verifikasi',
  })
  status: string;

  @Column({ length: 255, nullable: true })
  gambar: string;

  @Column('text', { nullable: true })
  deskripsi: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.portofolios)
  @JoinColumn({ name: 'id' }) // Tentukan nama kolom foreign key sebagai 'user_id'
  user: User;

  @OneToMany(() => PortofolioAnggota, (anggota) => anggota.portofolio, {
    cascade: true,
  })
  anggota: PortofolioAnggota[];

  @OneToMany(() => DetailProject, (detail) => detail.portofolio, {
    cascade: true,
  })
  detail_project: DetailProject[];

  @OneToMany(() => Tag, (tag) => tag.portofolio, {
    cascade: true,
  })
  tags: Tag[];
}
