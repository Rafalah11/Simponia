import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePortofolioDto } from './dto/create-portofolio.dto';
import { UpdatePortofolioDto } from './dto/update-portofolio.dto';
import { Portofolio } from './entities/portofolio.entity';
import { PortofolioAnggota } from '../portofolio-anggota/entities/portofolio-anggota.entity/portofolio-anggota.entity';
import { DetailProject } from '../detail-project/entities/detail-project.entity/detail-project.entity';
import { Tag } from '../tags/entities/tag.entity/tag.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PortofolioService {
  // userRepository: any;
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
  ) {}

  async create(createPortofolioDto: CreatePortofolioDto) {
    // Create main portofolio
    const portofolio = this.portofolioRepository.create({
      nama_projek: createPortofolioDto.nama_projek,
      kategori: createPortofolioDto.kategori,
      tahun: createPortofolioDto.tahun,
      status: createPortofolioDto.status || 'Belum di Verifikasi',
      gambar: createPortofolioDto.gambar,
      deskripsi: createPortofolioDto.deskripsi,
    });

    const savedPortofolio = await this.portofolioRepository.save(portofolio);

    // Handle anggota
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
          user: user, // Gunakan objek user yang ditemukan
        });

        await this.anggotaRepository.save(anggota);
      }
    }

    // Handle detail project (tetap sama seperti sebelumnya)
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

    // Handle tags (tetap sama seperti sebelumnya)
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
    return await this.portofolioRepository.find({
      relations: ['anggota', 'detail_project', 'tags'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const portofolio = await this.portofolioRepository.findOne({
      where: { id },
      relations: ['anggota', 'detail_project', 'tags'],
    });

    if (!portofolio) {
      return null; // Biarkan controller yang handle NotFoundException
    }

    return portofolio;
  }

  async update(id: string, updatePortofolioDto: UpdatePortofolioDto) {
    // Temukan portofolio yang akan diupdate
    const portofolio = await this.portofolioRepository.findOne({
      where: { id },
      relations: ['anggota', 'detail_project', 'tags'],
    });

    if (!portofolio) {
      throw new NotFoundException(`Portofolio with ID ${id} not found`);
    }

    // Update field utama
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

    // Simpan perubahan portofolio utama
    await this.portofolioRepository.save(portofolio);

    // Handle update anggota
    if (updatePortofolioDto.anggota !== undefined) {
      // Hapus semua anggota yang ada
      await this.anggotaRepository.delete({ portofolio: { id } });

      // Tambahkan anggota baru
      if (updatePortofolioDto.anggota.length > 0) {
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

    // Handle update detail project
    if (updatePortofolioDto.detail_project !== undefined) {
      // Hapus semua detail project yang ada
      await this.detailProjectRepository.delete({ portofolio: { id } });

      // Tambahkan detail project baru
      if (updatePortofolioDto.detail_project.length > 0) {
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

    // Handle update tags
    if (updatePortofolioDto.tags !== undefined) {
      // Hapus semua tags yang ada
      await this.tagRepository.delete({ portofolio: { id } });

      // Tambahkan tags baru
      if (updatePortofolioDto.tags.length > 0) {
        const tags = updatePortofolioDto.tags.map((tag) =>
          this.tagRepository.create({
            ...tag,
            portofolio: { id },
          }),
        );
        await this.tagRepository.save(tags);
      }
    }

    // Kembalikan data terbaru
    return this.findOne(id);
  }

  async remove(id: string) {
    const portofolio = await this.findOne(id);
    if (!portofolio) {
      throw new NotFoundException('Portofolio not found');
    }
    await this.portofolioRepository.remove(portofolio);
    return { message: 'Portofolio deleted successfully' };
  }
}
