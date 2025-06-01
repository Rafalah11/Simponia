import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfileAdminCommunityDto } from './dto/create-profile_admin-community.dto';
import { UpdateProfileAdminCommunityDto } from './dto/update-profile_admin-community.dto';
import { ProfileAdminCommunity } from './entities/profile_admin-community.entity';
import { User, UserRole } from '../user/entities/user.entity';

@Injectable()
export class ProfileAdminCommunityService {
  constructor(
    @InjectRepository(ProfileAdminCommunity)
    private profileAdminCommunityRepository: Repository<ProfileAdminCommunity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private checkRoleIsAdminCommunity(role: UserRole): void {
    if (role !== UserRole.ADMIN_COMMUNITY) {
      throw new ForbiddenException(
        `Hanya user dengan role ADMIN_COMMUNITY yang dapat melakukan operasi ini. Role Anda: ${role}`,
      );
    }
  }

  async create(createProfileAdminCommunityDto: CreateProfileAdminCommunityDto) {
    const user = await this.userRepository.findOne({
      where: { id: createProfileAdminCommunityDto.user_id },
      select: ['id', 'role'],
    });

    if (!user) {
      throw new NotFoundException(
        `User dengan ID ${createProfileAdminCommunityDto.user_id} tidak ditemukan`,
      );
    }

    this.checkRoleIsAdminCommunity(user.role);

    const existingProfile = await this.profileAdminCommunityRepository.findOne({
      where: { email: createProfileAdminCommunityDto.email },
    });
    if (existingProfile) {
      throw new BadRequestException('Email sudah digunakan');
    }

    const profileData = {
      ...createProfileAdminCommunityDto,
      user: user,
      tanggalLahir: new Date(createProfileAdminCommunityDto.tanggalLahir),
      profilePicture: createProfileAdminCommunityDto.profilePicture?.filename,
    };

    const profile = this.profileAdminCommunityRepository.create(profileData);

    try {
      return await this.profileAdminCommunityRepository.save(profile);
    } catch (error) {
      throw new BadRequestException(
        `Gagal membuat profile admin community: ${error.message}`,
      );
    }
  }

  async findAll() {
    const profiles = await this.profileAdminCommunityRepository.find({
      relations: ['user'],
    });
    return profiles.map((profile) => ({
      ...profile,
      profilePicture: profile.profilePicture
        ? `/uploads/admin-community/${profile.profilePicture}`
        : null,
    }));
  }

  async findOne(id: string) {
    const profile = await this.profileAdminCommunityRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException(
        `Profile admin community dengan ID ${id} tidak ditemukan`,
      );
    }
    if (profile.profilePicture) {
      profile.profilePicture = `/uploads/admin-community/${profile.profilePicture}`;
    }
    return profile;
  }

  async update(
    id: string,
    updateProfileAdminCommunityDto: UpdateProfileAdminCommunityDto,
  ) {
    const profile = await this.profileAdminCommunityRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(
        `Profile admin community dengan ID ${id} tidak ditemukan`,
      );
    }

    this.checkRoleIsAdminCommunity(profile.user.role);

    if (updateProfileAdminCommunityDto.user_id) {
      const user = await this.userRepository.findOne({
        where: { id: updateProfileAdminCommunityDto.user_id },
      });
      if (!user) {
        throw new NotFoundException(
          `User dengan ID ${updateProfileAdminCommunityDto.user_id} tidak ditemukan`,
        );
      }
      if (user.role !== UserRole.ADMIN_COMMUNITY) {
        throw new ForbiddenException(
          'Role tidak sesuai untuk mengupdate profile admin community',
        );
      }
      profile.user = user;
    }

    const updateData = {
      ...profile,
      ...updateProfileAdminCommunityDto,
      ...(updateProfileAdminCommunityDto.tanggalLahir && {
        tanggalLahir: new Date(updateProfileAdminCommunityDto.tanggalLahir),
      }),
      profilePicture: updateProfileAdminCommunityDto.profilePicture?.filename,
    };

    try {
      await this.profileAdminCommunityRepository.save(updateData);
      return this.findOne(id);
    } catch (error) {
      throw new BadRequestException('Gagal mengupdate profile admin community');
    }
  }

  async remove(id: string) {
    const profile = await this.profileAdminCommunityRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(
        `Profile admin community dengan ID ${id} tidak ditemukan`,
      );
    }

    // Validasi role sebelum menghapus
    this.checkRoleIsAdminCommunity(profile.user.role);

    try {
      await this.profileAdminCommunityRepository.remove(profile);
      return {
        success: true,
        message: `Profile admin community dengan ID ${id} berhasil dihapus`,
        deletedAt: new Date(),
      };
    } catch (error) {
      throw new BadRequestException('Gagal menghapus profile admin community');
    }
  }
  async findByUserId(userId: string): Promise<ProfileAdminCommunity | null> {
    const profile = await this.profileAdminCommunityRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (profile && profile.profilePicture) {
      profile.profilePicture = `/uploads/admin-community/${profile.profilePicture}`;
    }
    return profile;
  }
}
