import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfileUserDto } from './dto/create-profile_user.dto';
import { UpdateProfileUserDto } from './dto/update-profile_user.dto';
import { ProfileUser } from './entities/profile_user.entity';
import { User, UserRole } from '../user/entities/user.entity';

@Injectable()
export class ProfileUserService {
  constructor(
    @InjectRepository(ProfileUser)
    private profileUserRepository: Repository<ProfileUser>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private checkRoleIsMahasiswa(role: UserRole): void {
    if (role !== UserRole.MAHASISWA) {
      throw new ForbiddenException(
        `Hanya user dengan role MAHASISWA (3) yang dapat melakukan operasi ini. Role Anda: ${role}`,
      );
    }
  }

  async create(createProfileUserDto: CreateProfileUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: createProfileUserDto.user_id },
      select: ['id', 'role'],
    });

    if (!user) {
      throw new NotFoundException(
        `User dengan ID ${createProfileUserDto.user_id} tidak ditemukan`,
      );
    }

    this.checkRoleIsMahasiswa(user.role);

    const existingProfile = await this.profileUserRepository.findOne({
      where: { email: createProfileUserDto.email },
    });
    if (existingProfile) {
      throw new BadRequestException('Email sudah digunakan');
    }

    const profileData = {
      ...createProfileUserDto,
      user: user,
      profilePicture: createProfileUserDto.profilePicture?.filename,
    };

    const profile = this.profileUserRepository.create(profileData);

    try {
      return await this.profileUserRepository.save(profile);
    } catch (error) {
      throw new BadRequestException('Gagal membuat profile');
    }
  }

  async findOne(id: string) {
    const profile = await this.profileUserRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    return profile;
  }

  async update(id: string, updateProfileUserDto: UpdateProfileUserDto) {
    const profile = await this.profileUserRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile dengan ID ${id} tidak ditemukan`);
    }

    // Validasi role user yang terkait
    this.checkRoleIsMahasiswa(profile.user.role);

    if (updateProfileUserDto.user_id) {
      const user = await this.userRepository.findOne({
        where: { id: updateProfileUserDto.user_id },
      });
      if (!user) {
        throw new NotFoundException(
          `User dengan ID ${updateProfileUserDto.user_id} tidak ditemukan`,
        );
      }
      if (user.role === UserRole.OTHER) {
        throw new ForbiddenException(
          'Role tidak sesuai untuk mengupdate profile',
        );
      }
      profile.user = user;
    }

    try {
      await this.profileUserRepository.save({
        ...profile,
        ...updateProfileUserDto,
      });
      return this.findOne(id);
    } catch (error) {
      throw new BadRequestException('Gagal mengupdate profile');
    }
  }

  async remove(id: string) {
    const profile = await this.profileUserRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile dengan ID ${id} tidak ditemukan`);
    }

    // Validasi role sebelum menghapus
    this.checkRoleIsMahasiswa(profile.user.role);

    try {
      await this.profileUserRepository.remove(profile);
      return {
        success: true,
        message: `Profile dengan ID ${id} berhasil dihapus`,
        deletedAt: new Date(),
      };
    } catch (error) {
      throw new BadRequestException('Gagal menghapus profile');
    }
  }
  async findByUserId(userId: string): Promise<ProfileUser | null> {
    return this.profileUserRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
  findAll() {
    return this.profileUserRepository.find({ relations: ['user'] });
  }
}
