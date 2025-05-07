import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Portofolio } from '../../../portofolio/entities/portofolio.entity';

@Entity()
export class DetailProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Portofolio, (portofolio) => portofolio.detail_project, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_portofolio' })
  portofolio: Portofolio;

  @Column({ length: 255 })
  judul_link: string;

  @Column({ length: 512 })
  link_project: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
