export enum UserRole {
  ADMIN = '1',
  ADMIN_COMMUNITY = '2',
  MAHASISWA = '3',
  OTHER = '4',
}

import { ProfileUser } from '../../profile_user/entities/profile_user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nim: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MAHASISWA,
  })
  role: UserRole;

  @Column({ nullable: true })
  remember_token: string;

  @OneToOne(() => ProfileUser, (profile) => profile.user)
  profile: ProfileUser;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
  acara: any;
  portofolios: any;
}
