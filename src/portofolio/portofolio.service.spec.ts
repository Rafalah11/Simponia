import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portofolio } from './entities/portofolio.entity';
import { CreatePortofolioDto } from './dto/create-portofolio.dto';
import { UpdatePortofolioDto } from './dto/update-portofolio.dto';
import { PortofolioAnggota } from '../portofolio-anggota/entities/portofolio-anggota.entity/portofolio-anggota.entity';
import { DetailProject } from '../detail-project/entities/detail-project.entity/detail-project.entity';
import { Tag } from '../tags/entities/tag.entity/tag.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PortofolioService {
  constructor(
    @InjectRepository(Portofolio)
    private readonly portofolioRepository: Repository<Portofolio>,
    @InjectRepository(PortofolioAnggota)
    private readonly anggotaRepository: Repository<PortofolioAnggota>,
    @InjectRepository(DetailProject)
    private readonly detailProjectRepository: Repository<DetailProject>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createPortofolioDto: CreatePortofolioDto) {
    // Create main portofolio
    const portofolio = this.portofolioRepository.create({
      nama_projek: createPortofolioDto.nama_projek,
      kategori: createPortofolioDto.kategori,
      tahun: createPortofolioDto.tahun,
      status: createPortofolioDto.status,
      gambar: createPortofolioDto.gambar,
      deskripsi: createPortofolioDto.deskripsi,
    });

    const savedPortofolio = await this.portofolioRepository.save(portofolio);

    // Handle anggota creation
    if (createPortofolioDto.anggota && createPortofolioDto.anggota.length > 0) {
      for (const anggotaDto of createPortofolioDto.anggota) {
        const user = await this.userRepository.findOne({
          where: { id: anggotaDto.id_user },
        });
        if (!user) {
          throw new NotFoundException(
            `User with ID ${anggotaDto.id_user} not found`,
          );
        }

        const anggota = this.anggotaRepository.create({
          portofolio: savedPortofolio,
          user,
          role: anggotaDto.role,
          angkatan: anggotaDto.angkatan,
        });
        await this.anggotaRepository.save(anggota);
      }
    }

    // Handle detail project creation
    if (
      createPortofolioDto.detail_project &&
      createPortofolioDto.detail_project.length > 0
    ) {
      const detailProjects = createPortofolioDto.detail_project.map((detail) =>
        this.detailProjectRepository.create({
          portofolio: savedPortofolio,
          judul_link: detail.judul_link,
          link_project: detail.link_project,
        }),
      );
      await this.detailProjectRepository.save(detailProjects);
    }

    // Handle tags creation
    if (createPortofolioDto.tags && createPortofolioDto.tags.length > 0) {
      const tags = createPortofolioDto.tags.map((tag) =>
        this.tagRepository.create({
          portofolio: savedPortofolio,
          nama: tag.nama,
        }),
      );
      await this.tagRepository.save(tags);
    }

    return this.findOne(savedPortofolio.id);
  }

  async findAll() {
    return this.portofolioRepository.find({
      relations: ['anggota', 'anggota.user', 'detail_project', 'tags'],
    });
  }

  async findOne(id: string) {
    const portofolio = await this.portofolioRepository.findOne({
      where: { id },
      relations: ['anggota', 'anggota.user', 'detail_project', 'tags'],
    });

    if (!portofolio) {
      throw new NotFoundException(`Portofolio with ID ${id} not found`);
    }

    return portofolio;
  }

  async update(id: string, updatePortofolioDto: UpdatePortofolioDto) {
    const portofolio = await this.findOne(id);

    // Update main portofolio fields
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

    // Handle anggota updates (simplified - in real app you might want more sophisticated handling)
    if (updatePortofolioDto.anggota !== undefined) {
      await this.anggotaRepository.delete({ portofolio: { id } });

      if (updatePortofolioDto.anggota.length > 0) {
        for (const anggotaDto of updatePortofolioDto.anggota) {
          const user = await this.userRepository.findOne({
            where: { id: anggotaDto.id_user },
          });
          if (!user) {
            throw new NotFoundException(
              `User with ID ${anggotaDto.id_user} not found`,
            );
          }

          const anggota = this.anggotaRepository.create({
            portofolio,
            user,
            role: anggotaDto.role,
            angkatan: anggotaDto.angkatan,
          });
          await this.anggotaRepository.save(anggota);
        }
      }
    }

    // Handle detail project updates
    if (updatePortofolioDto.detail_project !== undefined) {
      await this.detailProjectRepository.delete({ portofolio: { id } });

      if (updatePortofolioDto.detail_project.length > 0) {
        const detailProjects = updatePortofolioDto.detail_project.map(
          (detail) =>
            this.detailProjectRepository.create({
              portofolio,
              judul_link: detail.judul_link,
              link_project: detail.link_project,
            }),
        );
        await this.detailProjectRepository.save(detailProjects);
      }
    }

    // Handle tags updates
    if (updatePortofolioDto.tags !== undefined) {
      await this.tagRepository.delete({ portofolio: { id } });

      if (updatePortofolioDto.tags.length > 0) {
        const tags = updatePortofolioDto.tags.map((tag) =>
          this.tagRepository.create({
            portofolio,
            nama: tag.nama,
          }),
        );
        await this.tagRepository.save(tags);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const portofolio = await this.findOne(id);
    await this.portofolioRepository.remove(portofolio);
    return { message: 'Portofolio deleted successfully' };
  }
}
