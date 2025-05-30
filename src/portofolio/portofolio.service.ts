import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePortofolioDto } from './dto/create-portofolio.dto';
import { UpdatePortofolioDto } from './dto/update-portofolio.dto';
import { Portofolio } from './entities/portofolio.entity';
import { PortofolioAnggota } from '../portofolio-anggota/entities/portofolio-anggota.entity/portofolio-anggota.entity';
import { DetailProject } from '../detail-project/entities/detail-project.entity/detail-project.entity';
import { Tag } from '../tags/entities/tag.entity/tag.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { ProfileUser } from '../profile_user/entities/profile_user.entity';
import { ProfileAdmin } from '../profile_admin/entities/profile_admin.entity';
import { ProfileAdminCommunity } from '../profile_admin-community/entities/profile_admin-community.entity';

@Injectable()
export class PortofolioService {
  constructor(
    @InjectRepository(Portofolio)
    private readonly portofolioRepository: Repository<Portofolio>,
    @InjectRepository(PortofolioAnggota)
    private readonly anggotaRepository: Repository<PortofolioAnggota>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DetailProject)
    private readonly detailProjectRepository: Repository<DetailProject>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(ProfileUser)
    private readonly profileUserRepository: Repository<ProfileUser>,
    @InjectRepository(ProfileAdmin)
    private readonly profileAdminRepository: Repository<ProfileAdmin>,
    @InjectRepository(ProfileAdminCommunity)
    private readonly profileAdminCommunityRepository: Repository<ProfileAdminCommunity>,
  ) {}

  private async getUserName(
    userId: string,
    role: UserRole,
  ): Promise<string | null> {
    if (role === UserRole.MAHASISWA) {
      const profile = await this.profileUserRepository.findOne({
        where: { user: { id: userId } },
      });
      return profile?.nama || null;
    } else if (role === UserRole.ADMIN) {
      const profile = await this.profileAdminRepository.findOne({
        where: { user: { id: userId } },
      });
      return profile?.nama || null;
    } else if (role === UserRole.ADMIN_COMMUNITY) {
      const profile = await this.profileAdminCommunityRepository.findOne({
        where: { user: { id: userId } },
      });
      return profile?.nama || null;
    }
    return null;
  }

  async create(createPortofolioDto: CreatePortofolioDto) {
    const user = await this.userRepository.findOne({
      where: { id: createPortofolioDto.user_id },
    });
    if (!user) {
      throw new NotFoundException(
        `User dengan ID ${createPortofolioDto.user_id} tidak ditemukan`,
      );
    }

    const portofolio = this.portofolioRepository.create({
      nama_projek: createPortofolioDto.nama_projek,
      kategori: createPortofolioDto.kategori,
      tahun: createPortofolioDto.tahun,
      status: createPortofolioDto.status || 'Belum di Verifikasi',
      gambar: createPortofolioDto.gambar,
      deskripsi: createPortofolioDto.deskripsi,
      user: user,
    });

    const savedPortofolio = await this.portofolioRepository.save(portofolio);

    if (createPortofolioDto.anggota && createPortofolioDto.anggota.length > 0) {
      for (const anggotaDto of createPortofolioDto.anggota) {
        const user = await this.userRepository.findOne({
          where: { id: anggotaDto.id_user },
        });

        if (!user) {
          throw new NotFoundException(
            `User dengan ID ${anggotaDto.id_user} tidak ditemukan`,
          );
        }

        const anggota = this.anggotaRepository.create({
          role: anggotaDto.role,
          angkatan: anggotaDto.angkatan,
          portofolio: savedPortofolio,
          user: user,
        });

        await this.anggotaRepository.save(anggota);
      }
    }

    if (
      createPortofolioDto.detail_project &&
      createPortofolioDto.detail_project.length > 0
    ) {
      const detailProjects = createPortofolioDto.detail_project.map((detail) =>
        this.detailProjectRepository.create({
          ...detail,
          portofolio: savedPortofolio,
        }),
      );
      await this.detailProjectRepository.save(detailProjects);
    }

    if (createPortofolioDto.tags && createPortofolioDto.tags.length > 0) {
      const tags = createPortofolioDto.tags.map((tag) =>
        this.tagRepository.create({
          ...tag,
          portofolio: savedPortofolio,
        }),
      );
      await this.tagRepository.save(tags);
    }

    return this.findOne(savedPortofolio.id);
  }

  async findAll() {
    const portofolios = await this.portofolioRepository.find({
      relations: ['anggota', 'anggota.user', 'detail_project', 'tags', 'user'],
      order: {
        created_at: 'DESC',
      },
    });

    return Promise.all(
      portofolios.map(async (portofolio) => {
        const creatorName = await this.getUserName(
          portofolio.user.id,
          portofolio.user.role,
        );

        const anggotaWithNames = await Promise.all(
          portofolio.anggota.map(async (anggota) => {
            const userName = await this.getUserName(
              anggota.user.id,
              anggota.user.role,
            );
            return {
              id: anggota.id,
              role: anggota.role,
              angkatan: anggota.angkatan,
              id_user: anggota.user.id,
              name: userName,
            };
          }),
        );

        return {
          ...portofolio,
          anggota: anggotaWithNames,
          creator: {
            user_id: portofolio.user.id,
            nim: portofolio.user.nim,
            name: creatorName,
            role: portofolio.user.role,
          },
        };
      }),
    );
  }

  async findOne(id: string) {
    const portofolio = await this.portofolioRepository.findOne({
      where: { id },
      relations: ['anggota', 'anggota.user', 'detail_project', 'tags', 'user'],
    });

    if (!portofolio) {
      return null;
    }

    const creatorName = await this.getUserName(
      portofolio.user.id,
      portofolio.user.role,
    );

    const anggotaWithNames = await Promise.all(
      portofolio.anggota.map(async (anggota) => {
        const userName = await this.getUserName(
          anggota.user.id,
          anggota.user.role,
        );
        return {
          id: anggota.id,
          role: anggota.role,
          angkatan: anggota.angkatan,
          id_user: anggota.user.id,
          name: userName,
        };
      }),
    );

    return {
      ...portofolio,
      anggota: anggotaWithNames,
      creator: {
        user_id: portofolio.user.id,
        nim: portofolio.user.nim,
        name: creatorName,
        role: portofolio.user.role,
      },
    };
  }

  async findOneEntity(id: string): Promise<Portofolio> {
    const portofolio = await this.portofolioRepository.findOne({
      where: { id },
      relations: ['anggota', 'detail_project', 'tags', 'user'],
    });

    if (!portofolio) {
      throw new NotFoundException(`Portofolio with ID ${id} not found`);
    }

    return portofolio;
  }

  async update(id: string, updatePortofolioDto: UpdatePortofolioDto) {
    const portofolio = await this.findOneEntity(id);

    if (updatePortofolioDto.nama_projek !== undefined) {
      portofolio.nama_projek = updatePortofolioDto.nama_projek;
    }
    if (updatePortofolioDto.kategori !== undefined) {
      portofolio.kategori = updatePortofolioDto.kategori;
    }
    if (updatePortofolioDto.tahun !== undefined) {
      portofolio.tahun = updatePortofolioDto.tahun;
    }
    if (updatePortofolioDto.status !== undefined) {
      portofolio.status = updatePortofolioDto.status;
    }
    if (updatePortofolioDto.gambar !== undefined) {
      portofolio.gambar = updatePortofolioDto.gambar;
    }
    if (updatePortofolioDto.deskripsi !== undefined) {
      portofolio.deskripsi = updatePortofolioDto.deskripsi;
    }

    await this.portofolioRepository.save(portofolio);

    if (updatePortofolioDto.anggota !== undefined) {
      await this.anggotaRepository.delete({ portofolio: { id } });
      if (
        updatePortofolioDto.anggota &&
        updatePortofolioDto.anggota.length > 0
      ) {
        for (const anggotaDto of updatePortofolioDto.anggota) {
          const user = await this.userRepository.findOne({
            where: { id: anggotaDto.id_user },
          });

          if (!user) {
            throw new NotFoundException(
              `User dengan ID ${anggotaDto.id_user} tidak ditemukan`,
            );
          }

          const anggota = this.anggotaRepository.create({
            role: anggotaDto.role,
            angkatan: anggotaDto.angkatan,
            portofolio: { id },
            user: user,
          });

          await this.anggotaRepository.save(anggota);
        }
      }
    }

    if (updatePortofolioDto.detail_project !== undefined) {
      await this.detailProjectRepository.delete({ portofolio: { id } });
      if (
        updatePortofolioDto.detail_project &&
        updatePortofolioDto.detail_project.length > 0
      ) {
        const detailProjects = updatePortofolioDto.detail_project.map(
          (detail) =>
            this.detailProjectRepository.create({
              ...detail,
              portofolio: { id },
            }),
        );
        await this.detailProjectRepository.save(detailProjects);
      }
    }

    if (updatePortofolioDto.tags !== undefined) {
      await this.tagRepository.delete({ portofolio: { id } });
      if (updatePortofolioDto.tags && updatePortofolioDto.tags.length > 0) {
        const tags = updatePortofolioDto.tags.map((tag) =>
          this.tagRepository.create({
            ...tag,
            portofolio: { id },
          }),
        );
        await this.tagRepository.save(tags);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const portofolio = await this.findOneEntity(id);
    await this.portofolioRepository.remove(portofolio);
    return { message: 'Portofolio deleted successfully' };
  }
}
