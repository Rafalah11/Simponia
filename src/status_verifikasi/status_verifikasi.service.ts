import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { StatusVerifikasi } from './entities/status_verifikasi.entity';
import { CreateStatusVerifikasiDto } from './dto/create-status_verifikasi.dto';
import { UpdateStatusVerifikasiDto } from './dto/update-status_verifikasi.dto';
import { Portofolio } from '../portofolio/entities/portofolio.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { ProfileUser } from '../profile_user/entities/profile_user.entity';

@Injectable()
export class StatusVerifikasiService {
  constructor(
    @InjectRepository(StatusVerifikasi)
    private readonly statusVerifikasiRepo: Repository<StatusVerifikasi>,
    @InjectRepository(Portofolio)
    private readonly portofolioRepo: Repository<Portofolio>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ProfileUser)
    private readonly profileUserRepo: Repository<ProfileUser>,
  ) {}

  async updateVerifiedPortfolioCount(profileUserId: string) {
    // Temukan profile user
    const profile = await this.profileUserRepo.findOne({
      where: { id: profileUserId },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException(
        `Profile user dengan ID ${profileUserId} tidak ditemukan`,
      );
    }

    // Validasi role
    if (
      profile.user.role !== UserRole.ADMIN &&
      profile.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new BadRequestException(
        `Hanya user dengan role ADMIN atau ADMIN_COMMUNITY yang dapat memverifikasi portofolio`,
      );
    }

    // Hitung jumlah portofolio unik yang diverifikasi oleh profile user ini
    const verifiedCount = await this.statusVerifikasiRepo
      .createQueryBuilder('status')
      .innerJoin('status.portofolio', 'portofolio')
      .where('portofolio.status = :status', { status: 'Terverifikasi' })
      .andWhere('status.profile_user = :profileUserId', { profileUserId })
      .distinctOn(['status.id_portofolio'])
      .getCount();

    // Update verified_portfolio_count
    await this.profileUserRepo.update(profile.id, {
      verifiedPortfolioCount: verifiedCount,
    });
  }

  async create(createStatusVerifikasiDto: CreateStatusVerifikasiDto) {
    const validStatuses = [
      'Belum di Verifikasi',
      'Proses Verifikasi',
      'Perlu Perubahan',
      'Terverifikasi',
      'Dihapus',
    ];
    if (!validStatuses.includes(createStatusVerifikasiDto.status)) {
      throw new BadRequestException('Status tidak valid');
    }

    // Validasi portofolio
    const portofolio = await this.portofolioRepo.findOneBy({
      id: createStatusVerifikasiDto.id_portofolio,
    });
    if (!portofolio) {
      throw new NotFoundException('Portofolio tidak ditemukan');
    }

    // Validasi user updated_by
    const user = await this.userRepo.findOneBy({
      id: createStatusVerifikasiDto.updated_by,
    });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Validasi role user
    if (
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new BadRequestException(
        `Hanya user dengan role ADMIN atau ADMIN_COMMUNITY yang dapat memverifikasi portofolio`,
      );
    }

    // Validasi profile_user dan pastikan sesuai dengan updated_by
    const profileUser = await this.profileUserRepo.findOne({
      where: {
        id: createStatusVerifikasiDto.profile_user,
        user: { id: createStatusVerifikasiDto.updated_by },
      },
      relations: ['user'],
    });
    if (!profileUser) {
      throw new BadRequestException(
        `Profile user dengan ID ${createStatusVerifikasiDto.profile_user} tidak sesuai dengan user ID ${createStatusVerifikasiDto.updated_by}`,
      );
    }

    // Cek apakah portofolio sudah diverifikasi oleh profile_user ini
    if (createStatusVerifikasiDto.status === 'Terverifikasi') {
      const existingVerification = await this.statusVerifikasiRepo.findOne({
        where: {
          id_portofolio: createStatusVerifikasiDto.id_portofolio,
          profile_user: createStatusVerifikasiDto.profile_user,
          portofolio: { status: 'Terverifikasi' },
        },
      });
      if (existingVerification) {
        throw new ConflictException(
          `Portofolio dengan ID ${createStatusVerifikasiDto.id_portofolio} sudah diverifikasi oleh profile user ini`,
        );
      }
    }

    // Update status portofolio
    await this.portofolioRepo.update(portofolio.id, {
      status: createStatusVerifikasiDto.status,
    });

    // Buat record status verifikasi baru
    const statusVerifikasi = this.statusVerifikasiRepo.create({
      id_portofolio: createStatusVerifikasiDto.id_portofolio,
      note: createStatusVerifikasiDto.note,
      updated_by: createStatusVerifikasiDto.updated_by,
      profile_user: createStatusVerifikasiDto.profile_user,
    });

    const savedStatus = await this.statusVerifikasiRepo.save(statusVerifikasi);

    // Update verified_portfolio_count jika status berubah
    await this.updateVerifiedPortfolioCount(
      createStatusVerifikasiDto.profile_user,
    );

    return savedStatus;
  }

  async findAll() {
    return this.statusVerifikasiRepo.find({
      relations: ['portofolio', 'updatedBy'],
    });
  }

  async findOne(id: number) {
    return this.statusVerifikasiRepo.findOne({
      where: { UniqueID: id },
      relations: ['portofolio', 'updatedBy'],
    });
  }
  async update(
    id: number,
    updateStatusVerifikasiDto: UpdateStatusVerifikasiDto,
  ) {
    const statusVerifikasi = await this.statusVerifikasiRepo.findOne({
      where: { UniqueID: id },
      relations: ['portofolio'],
    });
    if (!statusVerifikasi) {
      throw new NotFoundException('Status verifikasi tidak ditemukan');
    }

    const validStatuses = [
      'Belum di Verifikasi',
      'Proses Verifikasi',
      'Perlu Perubahan',
      'Terverifikasi',
      'Dihapus',
    ];
    if (
      updateStatusVerifikasiDto.status &&
      !validStatuses.includes(updateStatusVerifikasiDto.status)
    ) {
      throw new BadRequestException('Status tidak valid');
    }

    let profileUserId = statusVerifikasi.profile_user;
    if (updateStatusVerifikasiDto.profile_user) {
      const profileUser = await this.profileUserRepo.findOne({
        where: {
          id: updateStatusVerifikasiDto.profile_user,
          user: {
            id:
              updateStatusVerifikasiDto.updated_by ||
              statusVerifikasi.updated_by,
          },
        },
        relations: ['user'],
      });
      if (!profileUser) {
        throw new BadRequestException(
          `Profile user dengan ID ${updateStatusVerifikasiDto.profile_user} tidak sesuai dengan user ID`,
        );
      }
      if (
        profileUser.user.role !== UserRole.ADMIN &&
        profileUser.user.role !== UserRole.ADMIN_COMMUNITY
      ) {
        throw new BadRequestException(
          `Hanya user dengan role ADMIN atau ADMIN_COMMUNITY yang dapat memverifikasi portofolio`,
        );
      }
      profileUserId = updateStatusVerifikasiDto.profile_user;
    }

    if (updateStatusVerifikasiDto.status) {
      // Cek apakah portofolio sudah diverifikasi oleh profile_user ini
      if (
        updateStatusVerifikasiDto.status === 'Terverifikasi' &&
        profileUserId
      ) {
        const existingVerification = await this.statusVerifikasiRepo.findOne({
          where: {
            id_portofolio: statusVerifikasi.id_portofolio,
            profile_user: profileUserId,
            portofolio: { status: 'Terverifikasi' },
            UniqueID: Not(id),
          },
        });
        if (existingVerification) {
          throw new ConflictException(
            `Portofolio dengan ID ${statusVerifikasi.id_portofolio} sudah diverifikasi oleh profile user ini`,
          );
        }
      }

      // Update status portofolio
      await this.portofolioRepo.update(statusVerifikasi.id_portofolio, {
        status: updateStatusVerifikasiDto.status,
      });

      // Update verified_portfolio_count
      await this.updateVerifiedPortfolioCount(profileUserId);
    }

    const updateData: Partial<StatusVerifikasi> = {
      note: updateStatusVerifikasiDto.note,
      updated_by: updateStatusVerifikasiDto.updated_by,
    };
    if (updateStatusVerifikasiDto.profile_user) {
      updateData.profile_user = updateStatusVerifikasiDto.profile_user;
    }

    await this.statusVerifikasiRepo.update(id, updateData);

    return this.findOne(id);
  }
  // async update(
  //   id: number,
  //   updateStatusVerifikasiDto: UpdateStatusVerifikasiDto,
  // ) {
  //   const statusVerifikasi = await this.statusVerifikasiRepo.findOne({
  //     where: { UniqueID: id },
  //     relations: ['portofolio'],
  //   });
  //   if (!statusVerifikasi) {
  //     throw new NotFoundException('Status verifikasi tidak ditemukan');
  //   }

  //   const validStatuses = [
  //     'Belum di Verifikasi',
  //     'Proses Verifikasi',
  //     'Perlu Perubahan',
  //     'Terverifikasi',
  //     'Dihapus',
  //   ];
  //   if (
  //     updateStatusVerifikasiDto.status &&
  //     !validStatuses.includes(updateStatusVerifikasiDto.status)
  //   ) {
  //     throw new BadRequestException('Status tidak valid');
  //   }

  //   let profileUserId = statusVerifikasi.profile_user;
  //   if (updateStatusVerifikasiDto.profile_user) {
  //     const profileUser = await this.profileUserRepo.findOne({
  //       where: {
  //         id: updateStatusVerifikasiDto.profile_user,
  //         user: {
  //           id:
  //             updateStatusVerifikasiDto.updated_by ||
  //             statusVerifikasi.updated_by,
  //         },
  //       },
  //       relations: ['user'],
  //     });
  //     if (!profileUser) {
  //       throw new BadRequestException(
  //         `Profile user dengan ID ${updateStatusVerifikasiDto.profile_user} tidak sesuai dengan user ID`,
  //       );
  //     }
  //     if (
  //       profileUser.user.role !== UserRole.ADMIN &&
  //       profileUser.user.role !== UserRole.ADMIN_COMMUNITY
  //     ) {
  //       throw new BadRequestException(
  //         `Hanya user dengan role ADMIN atau ADMIN_COMMUNITY yang dapat memverifikasi portofolio`,
  //       );
  //     }
  //     profileUserId = updateStatusVerifikasiDto.profile_user;
  //   }

  //   if (updateStatusVerifikasiDto.status) {
  //     // Cek apakah portofolio sudah diverifikasi oleh profile_user ini
  //     if (
  //       updateStatusVerifikasiDto.status === 'Terverifikasi' &&
  //       profileUserId
  //     ) {
  //       const existingVerification = await this.statusVerifikasiRepo.findOne({
  //         where: {
  //           id_portofolio: statusVerifikasi.id_portofolio,
  //           profile_user: profileUserId,
  //           portofolio: { status: 'Terverifikasi' },
  //           UniqueID: Not(id),
  //         },
  //       });
  //       if (existingVerification) {
  //         throw new ConflictException(
  //           `Portofolio dengan ID ${statusVerifikasi.id_portofolio} sudah diverifikasi oleh profile user ini`,
  //         );
  //       }
  //     }

  //     // Update status portofolio
  //     await this.portofolioRepo.update(statusVerifikasi.id_portofolio, {
  //       status: updateStatusVerifikasiDto.status,
  //     });

  //     // Update verified_portfolio_count
  //     await this.updateVerifiedPortfolioCount(profileUserId);
  //   }

  //   const updateData: Partial<StatusVerifikasi> = {
  //     note: updateStatusVerifikasiDto.note,
  //     updated_by: updateStatusVerifikasiDto.updated_by,
  //   };
  //   if (updateStatusVerifikasiDto.profile_user) {
  //     updateData.profile_user = updateStatusVerifikasiDto.profile_user;
  //   }

  //   await this.statusVerifikasiRepo.update(id, updateData);

  //   return this.findOne(id);
  // }

  async remove(id: number) {
    const statusVerifikasi = await this.statusVerifikasiRepo.findOne({
      where: { UniqueID: id },
      relations: ['portofolio'],
    });
    if (!statusVerifikasi) {
      throw new NotFoundException('Status verifikasi tidak ditemukan');
    }

    // Update verified_portfolio_count jika status Terverifikasi dihapus
    if (
      statusVerifikasi.portofolio.status === 'Terverifikasi' &&
      statusVerifikasi.profile_user
    ) {
      await this.updateVerifiedPortfolioCount(statusVerifikasi.profile_user);
    }

    return this.statusVerifikasiRepo.delete(id);
  }

  async findByPortofolioId(portofolioId: string) {
    return this.statusVerifikasiRepo.find({
      where: { id_portofolio: portofolioId },
      relations: ['updatedBy'],
      order: { updated_at: 'DESC' },
    });
  }
}
