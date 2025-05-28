import { User } from '../../user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('profile_adminCommunity')
export class ProfileAdminCommunity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 255 })
  nama: string;

  @Column({ name: 'no_handphone', length: 20 })
  noHandphone: string;

  @Column({ type: 'enum', enum: ['L', 'P'] })
  gender: 'L' | 'P';

  @Column({ name: 'tanggal_lahir', type: 'date' })
  tanggalLahir: Date;

  @Column({ length: 255 })
  kota: string;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @Column({ length: 255, nullable: true })
  linkedin: string;

  @Column({ length: 255, nullable: true })
  instagram: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255, nullable: true })
  github: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({
    name: 'profile_picture',
    length: 255,
    nullable: true,
  })
  profilePicture: string;
}
