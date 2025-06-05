import { AnggotaAcara } from 'src/anggota-acara/entities/anggota-acara.entity';
import { User } from '../../user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Acara {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.acara)
  @JoinColumn({ name: 'id_user' })
  user: User;

  @Column()
  judul: string;

  @Column()
  tanggal: Date;

  @Column()
  jumlah_panitia: number;

  @Column()
  skor: number;

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

  @OneToMany(() => AnggotaAcara, (anggota) => anggota.acara, { cascade: true })
  anggota: AnggotaAcara[];
}
