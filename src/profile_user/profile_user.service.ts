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

    // this.checkRoleIsMahasiswa(user.role);

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
      throw new NotFoundException(`Profile dengan ID ${id} tidak ditemukan`);
    }
    if (profile.profilePicture) {
      profile.profilePicture = `/Uploads/user/${profile.profilePicture}`;
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

    // this.checkRoleIsMahasiswa(profile.user.role);

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

    // Tangani profilePicture secara eksplisit
    const updatedProfileData = {
      ...updateProfileUserDto,
      profilePicture: updateProfileUserDto.profilePicture
        ? updateProfileUserDto.profilePicture
        : profile.profilePicture, // Pertahankan gambar lama jika tidak ada file baru
    };

    try {
      await this.profileUserRepository.save({
        ...profile,
        ...updatedProfileData,
      });
      return this.findOne(id);
    } catch (error) {
      console.error('Error updating profile:', error); // Tambahkan logging untuk debugging
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
    const profile = await this.profileUserRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!profile) {
      return null;
    }
    if (profile.profilePicture) {
      profile.profilePicture = `/Uploads/user/${profile.profilePicture}`;
    }
    return profile;
  }

  findAll() {
    return this.profileUserRepository.find({ relations: ['user'] });
  }
}
