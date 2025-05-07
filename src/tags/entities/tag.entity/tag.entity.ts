import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Portofolio } from '../../../portofolio/entities/portofolio.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Portofolio, (portofolio) => portofolio.tags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_portofolio' })
  portofolio: Portofolio;

  @Column({ length: 100 })
  nama: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
