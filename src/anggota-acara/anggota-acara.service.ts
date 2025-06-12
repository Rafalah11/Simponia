import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
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
  ProfileIdDto,
} from './dto/anggota-acara-response.dto';
import { ProfileUser } from '../profile_user/entities/profile_user.entity';
// import { ProfileAdmin } from '../profile_admin/entities/profile_admin.entity';
// import { ProfileAdminCommunity } from '../profile_admin-community/entities/profile_admin-community.entity';

@Injectable()
export class AnggotaAcaraService {
  constructor(
    @InjectRepository(AnggotaAcara)
    private anggotaAcaraRepository: Repository<AnggotaAcara>,
    @InjectRepository(Acara)
    private acaraRepository: Repository<Acara>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ProfileUser)
    private profileUserRepository: Repository<ProfileUser>,
  ) {}

  private calculateGrade(average: number): string {
    let grade: string;
    if (average > 80) grade = 'A';
    else if (average >= 75) grade = 'B+';
    else if (average >= 70) grade = 'B';
    else if (average >= 60) grade = 'C+';
    else if (average >= 55) grade = 'C';
    else if (average >= 40) grade = 'D';
    else grade = 'E';

    return `${grade} (${average.toFixed(2)})`;
  }

  private async getProfileData(
    userId: string,
    role: UserRole,
  ): Promise<{ id: string; profile: ProfileUser }> {
    console.log(`Fetching profile data for userId: ${userId}, role: ${role}`);
    const profile = await this.profileUserRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    console.log(`Profile found:`, profile);
    if (!profile) {
      throw new NotFoundException(
        `Profile user untuk user ID ${userId} tidak ditemukan`,
      );
    }
    return { id: profile.id, profile };
  }

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

    const existingAnggota = await this.anggotaAcaraRepository.findOne({
      where: {
        user: { id: createAnggotaAcaraDto.id_user },
        acara: { id: createAnggotaAcaraDto.id_acara },
      },
    });
    if (existingAnggota) {
      throw new BadRequestException(
        `Pengguna dengan ID ${createAnggotaAcaraDto.id_user} sudah terdaftar sebagai anggota acara ini / Sudah memiliki Nilai`,
      );
    }

    let nilai_rata_rata: number | undefined;
    let grade: string | undefined;
    if (
      createAnggotaAcaraDto.kerjasama !== undefined &&
      createAnggotaAcaraDto.kedisiplinan !== undefined &&
      createAnggotaAcaraDto.komunikasi !== undefined &&
      createAnggotaAcaraDto.tanggung_jawab !== undefined
    ) {
      nilai_rata_rata =
        (createAnggotaAcaraDto.kerjasama +
          createAnggotaAcaraDto.kedisiplinan +
          createAnggotaAcaraDto.komunikasi +
          createAnggotaAcaraDto.tanggung_jawab) /
        4;
      grade = this.calculateGrade(nilai_rata_rata);
    }

    const anggotaAcara = this.anggotaAcaraRepository.create({
      ...createAnggotaAcaraDto,
      acara,
      user,
      nilai_rata_rata,
      grade,
      catatan: createAnggotaAcaraDto.catatan,
    });

    const savedAnggotaAcara =
      await this.anggotaAcaraRepository.save(anggotaAcara);

    const { id: profileId, profile } = await this.getProfileData(
      user.id,
      user.role,
    );

    return {
      id: savedAnggotaAcara.id,
      acara: {
        id: acara.id,
      },
      created_by: {
        id: user.id,
        nim: user.nim,
        role: user.role,
      },
      // profile_id: { id: profileId },
      id_user: savedAnggotaAcara.user?.id,
      nama: savedAnggotaAcara.nama,
      nim: savedAnggotaAcara.nim,
      gender: profile.gender,
      email: profile.email,
      nama_komunitas: profile.namaKomunitas,
      join_komunitas: profile.joinKomunitas,
      divisi: profile.divisi,
      posisi: profile.posisi,
      jabatan: savedAnggotaAcara.jabatan,
      status: savedAnggotaAcara.status,
      kerjasama: savedAnggotaAcara.kerjasama,
      kedisiplinan: savedAnggotaAcara.kedisiplinan,
      komunikasi: savedAnggotaAcara.komunikasi,
      tanggung_jawab: savedAnggotaAcara.tanggung_jawab,
      nilai_rata_rata: savedAnggotaAcara.nilai_rata_rata,
      grade: savedAnggotaAcara.grade,
      catatan: savedAnggotaAcara.catatan,
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

    return Promise.all(
      anggotaAcaraList.map(async (anggotaAcara) => {
        const { id: profileId, profile } = await this.getProfileData(
          anggotaAcara.user.id,
          anggotaAcara.user.role,
        );
        return {
          id: anggotaAcara.id,
          acara: {
            id: anggotaAcara.acara.id,
          },
          created_by: {
            id: anggotaAcara.user.id,
            nim: anggotaAcara.user.nim,
            role: anggotaAcara.user.role,
          },
          // profile_id: { id: profileId },
          id_user: anggotaAcara.user?.id,
          nama: anggotaAcara.nama,
          nim: anggotaAcara.nim,
          gender: profile.gender,
          email: profile.email,
          nama_komunitas: profile.namaKomunitas,
          join_komunitas: profile.joinKomunitas,
          divisi: profile.divisi,
          posisi: profile.posisi,
          jabatan: anggotaAcara.jabatan,
          status: anggotaAcara.status,
          kerjasama: anggotaAcara.kerjasama,
          kedisiplinan: anggotaAcara.kedisiplinan,
          komunikasi: anggotaAcara.komunikasi,
          tanggung_jawab: anggotaAcara.tanggung_jawab,
          nilai_rata_rata: anggotaAcara.nilai_rata_rata,
          grade: anggotaAcara.grade,
          catatan: anggotaAcara.catatan,
          created_at: anggotaAcara.created_at,
          updated_at: anggotaAcara.updated_at,
        };
      }),
    );
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

    const { id: profileId, profile } = await this.getProfileData(
      anggotaAcara.user.id,
      anggotaAcara.user.role,
    );

    return {
      id: anggotaAcara.id,
      acara: {
        id: anggotaAcara.acara.id,
      },
      created_by: {
        id: anggotaAcara.user.id,
        nim: anggotaAcara.user.nim,
        role: anggotaAcara.user.role,
      },
      // profile_id: { id: profileId },
      id_user: anggotaAcara.user?.id,
      nama: anggotaAcara.nama,
      nim: anggotaAcara.nim,
      gender: profile.gender,
      email: profile.email,
      nama_komunitas: profile.namaKomunitas,
      join_komunitas: profile.joinKomunitas,
      divisi: profile.divisi,
      posisi: profile.posisi,
      jabatan: anggotaAcara.jabatan,
      status: anggotaAcara.status,
      kerjasama: anggotaAcara.kerjasama,
      kedisiplinan: anggotaAcara.kedisiplinan,
      komunikasi: anggotaAcara.komunikasi,
      tanggung_jawab: anggotaAcara.tanggung_jawab,
      nilai_rata_rata: anggotaAcara.nilai_rata_rata,
      grade: anggotaAcara.grade,
      catatan: anggotaAcara.catatan,
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

      const isUserRegisteredInAcara = await this.anggotaAcaraRepository.findOne(
        {
          where: {
            user: { id: updateAnggotaAcaraDto.id_user },
            acara: { id: updatedAcara.id },
          },
        },
      );

      if (isUserRegisteredInAcara && isUserRegisteredInAcara.id !== id) {
        throw new BadRequestException(
          `Pengguna dengan ID ${updateAnggotaAcaraDto.id_user} sudah terdaftar sebagai anggota acara dengan ID ${updatedAcara.id}`,
        );
      }

      updatedUser = user;
    }

    let nilai_rata_rata = anggotaAcara.nilai_rata_rata;
    let grade = anggotaAcara.grade;
    if (
      updateAnggotaAcaraDto.kerjasama !== undefined ||
      updateAnggotaAcaraDto.kedisiplinan !== undefined ||
      updateAnggotaAcaraDto.komunikasi !== undefined ||
      updateAnggotaAcaraDto.tanggung_jawab !== undefined
    ) {
      const kerjasama =
        updateAnggotaAcaraDto.kerjasama ?? anggotaAcara.kerjasama;
      const kedisiplinan =
        updateAnggotaAcaraDto.kedisiplinan ?? anggotaAcara.kedisiplinan;
      const komunikasi =
        updateAnggotaAcaraDto.komunikasi ?? anggotaAcara.komunikasi;
      const tanggung_jawab =
        updateAnggotaAcaraDto.tanggung_jawab ?? anggotaAcara.tanggung_jawab;

      if (
        kerjasama !== undefined &&
        kedisiplinan !== undefined &&
        komunikasi !== undefined &&
        tanggung_jawab !== undefined
      ) {
        nilai_rata_rata =
          (kerjasama + kedisiplinan + komunikasi + tanggung_jawab) / 4;
        grade = this.calculateGrade(nilai_rata_rata);
      }
    }

    this.anggotaAcaraRepository.merge(anggotaAcara, {
      ...updateAnggotaAcaraDto,
      acara: updatedAcara,
      user: updatedUser,
      nilai_rata_rata,
      grade,
      catatan: updateAnggotaAcaraDto.catatan,
    });

    const savedAnggotaAcara =
      await this.anggotaAcaraRepository.save(anggotaAcara);

    const { id: profileId, profile } = await this.getProfileData(
      updatedUser.id,
      updatedUser.role,
    );

    return {
      id: savedAnggotaAcara.id,
      acara: {
        id: updatedAcara.id,
      },
      created_by: {
        id: updatedUser.id,
        nim: updatedUser.nim,
        role: updatedUser.role,
      },
      // profile_id: { id: profileId },
      id_user: savedAnggotaAcara.user?.id,
      nama: savedAnggotaAcara.nama,
      nim: savedAnggotaAcara.nim,
      gender: profile.gender,
      email: profile.email,
      nama_komunitas: profile.namaKomunitas,
      join_komunitas: profile.joinKomunitas,
      divisi: profile.divisi,
      posisi: profile.posisi,
      jabatan: savedAnggotaAcara.jabatan,
      status: savedAnggotaAcara.status,
      kerjasama: savedAnggotaAcara.kerjasama,
      kedisiplinan: savedAnggotaAcara.kedisiplinan,
      komunikasi: savedAnggotaAcara.komunikasi,
      tanggung_jawab: savedAnggotaAcara.tanggung_jawab,
      nilai_rata_rata: savedAnggotaAcara.nilai_rata_rata,
      grade: savedAnggotaAcara.grade,
      catatan: savedAnggotaAcara.catatan,
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
