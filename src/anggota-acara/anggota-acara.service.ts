import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnggotaAcara } from './entities/anggota-acara.entity';
import { CreateAnggotaAcaraDto } from './dto/create-anggota-acara.dto';
import { UpdateAnggotaAcaraDto } from './dto/update-anggota-acara.dto';
import { Acara } from '../acara/entities/acara.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { AuthRequest } from '../auth/interfaces/auth-request.interface';
import {
  AnggotaAcaraResponseDto,
  DeleteAnggotaAcaraResponseDto,
} from './dto/anggota-acara-response.dto';

@Injectable()
export class AnggotaAcaraService {
  constructor(
    @InjectRepository(AnggotaAcara)
    private anggotaAcaraRepository: Repository<AnggotaAcara>,
    @InjectRepository(Acara)
    private acaraRepository: Repository<Acara>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createAnggotaAcaraDto: CreateAnggotaAcaraDto,
    req: AuthRequest,
  ): Promise<AnggotaAcaraResponseDto> {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }

    const acara = await this.acaraRepository.findOne({
      where: { id: createAnggotaAcaraDto.id_acara },
    });
    if (!acara) {
      throw new NotFoundException(
        `Acara dengan ID ${createAnggotaAcaraDto.id_acara} tidak ditemukan`,
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: createAnggotaAcaraDto.id_user },
    });
    if (!user) {
      throw new NotFoundException(
        `Pengguna dengan ID ${createAnggotaAcaraDto.id_user} tidak ditemukan`,
      );
    }

    const anggotaAcara = this.anggotaAcaraRepository.create({
      ...createAnggotaAcaraDto,
      acara,
      user,
    });

    const savedAnggotaAcara =
      await this.anggotaAcaraRepository.save(anggotaAcara);

    return {
      id: savedAnggotaAcara.id,
      acara: {
        id: acara.id,
        judul: acara.judul,
        tanggal: acara.tanggal,
        jumlah_panitia: acara.jumlah_panitia,
        skor: acara.skor,
        status: acara.status,
        gambar: acara.gambar,
        deskripsi: acara.deskripsi,
        created_at: acara.created_at,
        updated_at: acara.updated_at,
      },
      created_by: {
        id: user.id,
        nim: user.nim,
        role: user.role,
      },
      nama: savedAnggotaAcara.nama,
      nim: savedAnggotaAcara.nim,
      jabatan: savedAnggotaAcara.jabatan,
      created_at: savedAnggotaAcara.created_at,
      updated_at: savedAnggotaAcara.updated_at,
    };
  }

  async findAll(req: AuthRequest): Promise<AnggotaAcaraResponseDto[]> {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }

    const anggotaAcaraList = await this.anggotaAcaraRepository.find({
      relations: ['acara', 'user'],
    });

    return anggotaAcaraList.map((anggotaAcara) => ({
      id: anggotaAcara.id,
      acara: {
        id: anggotaAcara.acara.id,
        judul: anggotaAcara.acara.judul,
        tanggal: anggotaAcara.acara.tanggal,
        jumlah_panitia: anggotaAcara.acara.jumlah_panitia,
        skor: anggotaAcara.acara.skor,
        status: anggotaAcara.acara.status,
        gambar: anggotaAcara.acara.gambar,
        deskripsi: anggotaAcara.acara.deskripsi,
        created_at: anggotaAcara.acara.created_at,
        updated_at: anggotaAcara.acara.updated_at,
      },
      created_by: {
        id: anggotaAcara.user.id,
        nim: anggotaAcara.user.nim,
        role: anggotaAcara.user.role,
      },
      nama: anggotaAcara.nama,
      nim: anggotaAcara.nim,
      jabatan: anggotaAcara.jabatan,
      created_at: anggotaAcara.created_at,
      updated_at: anggotaAcara.updated_at,
    }));
  }

  async findOne(
    id: string,
    req: AuthRequest,
  ): Promise<AnggotaAcaraResponseDto> {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }

    const anggotaAcara = await this.anggotaAcaraRepository.findOne({
      where: { id },
      relations: ['acara', 'user'],
    });

    if (!anggotaAcara) {
      throw new NotFoundException(
        `Panitia Acara dengan ID ${id} tidak ditemukan`,
      );
    }

    return {
      id: anggotaAcara.id,
      acara: {
        id: anggotaAcara.acara.id,
        judul: anggotaAcara.acara.judul,
        tanggal: anggotaAcara.acara.tanggal,
        jumlah_panitia: anggotaAcara.acara.jumlah_panitia,
        skor: anggotaAcara.acara.skor,
        status: anggotaAcara.acara.status,
        gambar: anggotaAcara.acara.gambar,
        deskripsi: anggotaAcara.acara.deskripsi,
        created_at: anggotaAcara.acara.created_at,
        updated_at: anggotaAcara.acara.updated_at,
      },
      created_by: {
        id: anggotaAcara.user.id,
        nim: anggotaAcara.user.nim,
        role: anggotaAcara.user.role,
      },
      nama: anggotaAcara.nama,
      nim: anggotaAcara.nim,
      jabatan: anggotaAcara.jabatan,
      created_at: anggotaAcara.created_at,
      updated_at: anggotaAcara.updated_at,
    };
  }

  async update(
    id: string,
    updateAnggotaAcaraDto: UpdateAnggotaAcaraDto,
    req: AuthRequest,
  ): Promise<AnggotaAcaraResponseDto> {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }

    const anggotaAcara = await this.anggotaAcaraRepository.findOne({
      where: { id },
      relations: ['acara', 'user'],
    });

    if (!anggotaAcara) {
      throw new NotFoundException(
        `Panitia Acara dengan ID ${id} tidak ditemukan`,
      );
    }

    let updatedAcara = anggotaAcara.acara;
    let updatedUser = anggotaAcara.user;

    if (updateAnggotaAcaraDto.id_acara) {
      const acara = await this.acaraRepository.findOne({
        where: { id: updateAnggotaAcaraDto.id_acara },
      });
      if (!acara) {
        throw new NotFoundException(
          `Acara dengan ID ${updateAnggotaAcaraDto.id_acara} tidak ditemukan`,
        );
      }
      updatedAcara = acara;
    }

    if (updateAnggotaAcaraDto.id_user) {
      const user = await this.userRepository.findOne({
        where: { id: updateAnggotaAcaraDto.id_user },
      });
      if (!user) {
        throw new NotFoundException(
          `Pengguna dengan ID ${updateAnggotaAcaraDto.id_user} tidak ditemukan`,
        );
      }
      updatedUser = user;
    }

    this.anggotaAcaraRepository.merge(anggotaAcara, {
      ...updateAnggotaAcaraDto,
      acara: updatedAcara,
      user: updatedUser,
    });

    const savedAnggotaAcara =
      await this.anggotaAcaraRepository.save(anggotaAcara);

    return {
      id: savedAnggotaAcara.id,
      acara: {
        id: updatedAcara.id,
        judul: updatedAcara.judul,
        tanggal: updatedAcara.tanggal,
        jumlah_panitia: updatedAcara.jumlah_panitia,
        skor: updatedAcara.skor,
        status: updatedAcara.status,
        gambar: updatedAcara.gambar,
        deskripsi: updatedAcara.deskripsi,
        created_at: updatedAcara.created_at,
        updated_at: updatedAcara.updated_at,
      },
      created_by: {
        id: updatedUser.id,
        nim: updatedUser.nim,
        role: updatedUser.role,
      },
      nama: savedAnggotaAcara.nama,
      nim: savedAnggotaAcara.nim,
      jabatan: savedAnggotaAcara.jabatan,
      created_at: savedAnggotaAcara.created_at,
      updated_at: savedAnggotaAcara.updated_at,
    };
  }

  async remove(
    id: string,
    req: AuthRequest,
  ): Promise<DeleteAnggotaAcaraResponseDto> {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }

    const result = await this.anggotaAcaraRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Panitia Acara dengan ID ${id} not found`);
    }
    return {
      message: 'Panitia telah dihapus',
    };
  }
}
