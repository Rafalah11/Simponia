import { User } from '../../user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Acara {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.acara)
  @JoinColumn({ name: 'id_user' }) // Tentukan nama kolom foreign key
  user: User;

  @Column()
  judul: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ketua_pelaksana' }) // Tentukan nama kolom foreign key
  ketua_pelaksana: User;

  @Column()
  tanggal: Date;

  @Column()
  jumlah_panitia: number;

  @Column({
    type: 'enum',
    enum: ['active', 'ongoing', 'finished'],
    default: 'ongoing',
  })
  status: string;

  @Column({ nullable: true })
  gambar: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
