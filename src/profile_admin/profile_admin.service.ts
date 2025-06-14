import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfileAdminDto } from './dto/create-profile_admin.dto';
import { UpdateProfileAdminDto } from './dto/update-profile_admin.dto';
import { ProfileAdmin } from './entities/profile_admin.entity';
import { User, UserRole } from '../user/entities/user.entity';

@Injectable()
export class ProfileAdminService {
  constructor(
    @InjectRepository(ProfileAdmin)
    private profileAdminRepository: Repository<ProfileAdmin>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private checkRoleIsAdmin(role: UserRole): void {
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        `Hanya user dengan role ADMIN yang dapat melakukan operasi ini. Role Anda: ${role}`,
      );
    }
  }

  async create(createProfileAdminDto: CreateProfileAdminDto) {
    const user = await this.userRepository.findOne({
      where: { id: createProfileAdminDto.user_id },
      select: ['id', 'role'],
    });

    if (!user) {
      throw new NotFoundException(
        `User dengan ID ${createProfileAdminDto.user_id} tidak ditemukan`,
      );
    }

    this.checkRoleIsAdmin(user.role);

    const existingProfile = await this.profileAdminRepository.findOne({
      where: { email: createProfileAdminDto.email },
    });
    if (existingProfile) {
      throw new BadRequestException('Email sudah digunakan');
    }

    const profileData = {
      ...createProfileAdminDto,
      user: user,
      tanggalLahir: new Date(createProfileAdminDto.tanggalLahir),
      profilePicture: createProfileAdminDto.profilePicture?.filename,
    };

    const profile = this.profileAdminRepository.create(profileData);

    try {
      return await this.profileAdminRepository.save(profile);
    } catch (error) {
      throw new BadRequestException(
        `Gagal membuat profile admin: ${error.message}`,
      );
    }
  }

  async findAll() {
    const profiles = await this.profileAdminRepository.find({
      relations: ['user'],
    });
    return profiles.map((profile) => ({
      ...profile,
      profilePicture: profile.profilePicture
        ? `/uploads/admin/${profile.profilePicture}`
        : null,
    }));
  }

  async findOne(id: string) {
    const profile = await this.profileAdminRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException(
        `Profile admin dengan ID ${id} tidak ditemukan`,
      );
    }
    if (profile.profilePicture) {
      profile.profilePicture = `/uploads/admin/${profile.profilePicture}`;
    }
    return profile;
  }

  async update(id: string, updateProfileAdminDto: UpdateProfileAdminDto) {
    const profile = await this.profileAdminRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(
        `Profile admin dengan ID ${id} tidak ditemukan`,
      );
    }

    this.checkRoleIsAdmin(profile.user.role);

    if (updateProfileAdminDto.user_id) {
      const user = await this.userRepository.findOne({
        where: { id: updateProfileAdminDto.user_id },
      });
      if (!user) {
        throw new NotFoundException(
          `User dengan ID ${updateProfileAdminDto.user_id} tidak ditemukan`,
        );
      }
      if (user.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'Role tidak sesuai untuk mengupdate profile admin',
        );
      }
      profile.user = user;
    }

    const updateData = {
      ...profile,
      ...updateProfileAdminDto,
      ...(updateProfileAdminDto.tanggalLahir && {
        tanggalLahir: new Date(updateProfileAdminDto.tanggalLahir),
      }),
      profilePicture:
        updateProfileAdminDto.profilePicture?.filename ||
        profile.profilePicture,
    };

    try {
      await this.profileAdminRepository.save(updateData);
      return this.findOne(id);
    } catch (error) {
      throw new BadRequestException('Gagal mengupdate profile admin');
    }
  }

  async remove(id: string) {
    const profile = await this.profileAdminRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(
        `Profile admin dengan ID ${id} tidak ditemukan`,
      );
    }

    this.checkRoleIsAdmin(profile.user.role);

    try {
      await this.profileAdminRepository.remove(profile);
      return {
        success: true,
        message: `Profile admin dengan ID ${id} berhasil dihapus`,
        deletedAt: new Date(),
      };
    } catch (error) {
      throw new BadRequestException('Gagal menghapus profile admin');
    }
  }

  async findByUserId(userId: string): Promise<ProfileAdmin | null> {
    const profile = await this.profileAdminRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (profile && profile.profilePicture) {
      profile.profilePicture = `/uploads/admin/${profile.profilePicture}`;
    }
    return profile;
  }
}
