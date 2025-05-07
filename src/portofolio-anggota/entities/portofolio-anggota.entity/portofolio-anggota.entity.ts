import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Portofolio } from '../../../portofolio/entities/portofolio.entity';
import { User } from '../../../user/entities/user.entity';

@Entity('portofolio_anggota') // Pastikan nama tabel sesuai database
export class PortofolioAnggota {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Portofolio, (portofolio) => portofolio.anggota, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_portofolio' }) // Sesuaikan dengan nama kolom FK di database
  portofolio: Portofolio;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'id_user' }) // Sesuaikan dengan nama kolom FK di database
  user: User;

  @Column({ length: 100 })
  role: string;

  @Column({ length: 10 })
  angkatan: string;

  @Column({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
