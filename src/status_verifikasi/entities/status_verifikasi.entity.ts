import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Portofolio } from '../../portofolio/entities/portofolio.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class StatusVerifikasi {
  @PrimaryGeneratedColumn()
  UniqueID: number;

  // Foreign key ke tabel Portofolio
  @Column({ type: 'char', length: 36 })
  id_portofolio: string;

  @ManyToOne(() => Portofolio, (portofolio) => portofolio.id)
  @JoinColumn({ name: 'id_portofolio' }) // Relasi ke tabel Portofolio
  portofolio: Portofolio;

  @Column({ type: 'text', nullable: true })
  note: string;

  // Foreign key ke tabel User
  @Column({ type: 'char', length: 36 })
  updated_by: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
