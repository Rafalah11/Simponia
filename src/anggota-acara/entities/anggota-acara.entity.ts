import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Acara } from '../../acara/entities/acara.entity';
import { User } from '../../user/entities/user.entity';

@Entity('anggota_acara')
export class AnggotaAcara {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Acara, (acara) => acara.anggota, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_acara' })
  acara: Acara;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @Column({ length: 255, nullable: true })
  nama: string;

  @Column({ length: 50, nullable: true })
  nim: string;

  @Column({ length: 100 })
  jabatan: string;

  @Column({ default: 'ABSENT' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
