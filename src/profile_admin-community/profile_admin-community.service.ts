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

    const existingUserProfile =
      await this.profileAdminCommunityRepository.findOne({
        where: { user: { id: createProfileAdminCommunityDto.user_id } },
      });
    if (existingUserProfile) {
      throw new BadRequestException('User sudah memiliki profile');
    }

    const profileData = {
      ...createProfileAdminCommunityDto,
      user,
      tanggalLahir: createProfileAdminCommunityDto.tanggalLahir
        ? new Date(createProfileAdminCommunityDto.tanggalLahir)
        : undefined,
      joinKomunitas: createProfileAdminCommunityDto.joinKomunitas
        ? new Date(createProfileAdminCommunityDto.joinKomunitas)
        : undefined,
      profilePicture: createProfileAdminCommunityDto.profilePicture?.filename,
    };

    if (profileData.tanggalLahir && isNaN(profileData.tanggalLahir.getTime())) {
      throw new BadRequestException('Format tanggalLahir tidak valid');
    }
    if (
      profileData.joinKomunitas &&
      isNaN(profileData.joinKomunitas.getTime())
    ) {
      throw new BadRequestException('Format joinKomunitas tidak valid');
    }

    const profile = this.profileAdminCommunityRepository.create(profileData);

    try {
      return await this.profileAdminCommunityRepository.save(profile);
    } catch (error) {
      console.error('Create error:', error);
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

    if (
      updateProfileAdminCommunityDto.email &&
      updateProfileAdminCommunityDto.email !== profile.email
    ) {
      const existingProfile =
        await this.profileAdminCommunityRepository.findOne({
          where: { email: updateProfileAdminCommunityDto.email },
        });
      if (existingProfile) {
        throw new BadRequestException('Email sudah digunakan');
      }
    }

    const updateData = {
      ...updateProfileAdminCommunityDto,
      tanggalLahir: updateProfileAdminCommunityDto.tanggalLahir
        ? new Date(updateProfileAdminCommunityDto.tanggalLahir)
        : profile.tanggalLahir,
      joinKomunitas: updateProfileAdminCommunityDto.joinKomunitas
        ? new Date(updateProfileAdminCommunityDto.joinKomunitas)
        : profile.joinKomunitas,
      profilePicture:
        updateProfileAdminCommunityDto.profilePicture?.filename ||
        profile.profilePicture,
    };

    // Hapus properti yang tidak ada di entitas
    delete updateData.user_id;

    // Validasi tanggalLahir
    if (updateData.tanggalLahir) {
      const tanggalLahirDate =
        updateData.tanggalLahir instanceof Date
          ? updateData.tanggalLahir
          : new Date(updateData.tanggalLahir);
      if (isNaN(tanggalLahirDate.getTime())) {
        throw new BadRequestException('Format tanggalLahir tidak valid');
      }
      updateData.tanggalLahir = tanggalLahirDate;
    }

    // Validasi joinKomunitas
    if (updateData.joinKomunitas) {
      const joinKomunitasDate =
        updateData.joinKomunitas instanceof Date
          ? updateData.joinKomunitas
          : new Date(updateData.joinKomunitas);
      if (isNaN(joinKomunitasDate.getTime())) {
        throw new BadRequestException('Format joinKomunitas tidak valid');
      }
      updateData.joinKomunitas = joinKomunitasDate;
    }

    console.log('updateData:', updateData);

    try {
      await this.profileAdminCommunityRepository.update(id, updateData);
      return await this.findOne(id);
    } catch (error) {
      console.error('Update error:', error);
      throw new BadRequestException(
        `Gagal mengupdate profile admin community: ${error.message}`,
      );
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

    try {
      await this.profileAdminCommunityRepository.remove(profile);
      return {
        success: true,
        message: `Profile admin community dengan ID ${id} berhasil dihapus`,
        deletedAt: new Date(),
      };
    } catch (error) {
      console.error('Delete error:', error);
      throw new BadRequestException(
        `Gagal menghapus profile admin community: ${error.message}`,
      );
    }
  }
}
