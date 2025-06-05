import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Acara } from './entities/acara.entity';
import { CreateAcaraDto } from './dto/create-acara.dto';
import { UpdateAcaraDto } from './dto/update-acara.dto';
import { AcaraResponseDto } from './dto/acara-response.dto';
import { User, UserRole } from '../user/entities/user.entity';
import { AnggotaAcara } from '../anggota-acara/entities/anggota-acara.entity';
import { ProfileUser } from '../profile_user/entities/profile_user.entity';
import { ProfileAdmin } from '../profile_admin/entities/profile_admin.entity';
import { ProfileAdminCommunity } from '../profile_admin-community/entities/profile_admin-community.entity';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class AcaraService {
  constructor(
    @InjectRepository(Acara)
    private acaraRepository: Repository<Acara>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AnggotaAcara)
    private anggotaAcaraRepository: Repository<AnggotaAcara>,
    @InjectRepository(ProfileUser)
    private profileUserRepository: Repository<ProfileUser>,
    @InjectRepository(ProfileAdmin)
    private profileAdminRepository: Repository<ProfileAdmin>,
    @InjectRepository(ProfileAdminCommunity)
    private profileAdminCommunityRepository: Repository<ProfileAdminCommunity>,
  ) {}

  private calculateGrade(average: number): string {
    if (average > 80) return 'A';
    if (average >= 75) return 'B+';
    if (average >= 70) return 'B';
    if (average >= 60) return 'C+';
    if (average >= 55) return 'C';
    if (average >= 40) return 'D';
    return 'E';
  }

  private async getUserName(
    userId: string,
    role: UserRole,
  ): Promise<string | null> {
    console.log(`Fetching name for userId: ${userId}, role: ${role}`);
    if (role === UserRole.MAHASISWA) {
      const profile = await this.profileUserRepository.findOne({
        where: { user: { id: userId } },
      });
      console.log(`ProfileUser found:`, profile);
      return profile?.nama || null;
    } else if (role === UserRole.ADMIN) {
      const profile = await this.profileAdminRepository.findOne({
        where: { user: { id: userId } },
      });
      console.log(`ProfileAdmin found:`, profile);
      return profile?.nama || null;
    } else if (role === UserRole.ADMIN_COMMUNITY) {
      const profile = await this.profileAdminCommunityRepository.findOne({
        where: { user: { id: userId } },
      });
      console.log(`ProfileAdminCommunity found:`, profile);
      return profile?.nama || null;
    }
    console.log(`No matching role for userId: ${userId}, role: ${role}`);
    return null;
  }

  async create(createAcaraDto: CreateAcaraDto): Promise<AcaraResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: createAcaraDto.id_user },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    createAcaraDto.id_user = user.id;

    console.log('Creating acara with gambar:', createAcaraDto.gambar);

    const acara = this.acaraRepository.create({
      ...createAcaraDto,
      user,
    });

    const savedAcara = await this.acaraRepository.save(acara);

    if (createAcaraDto.anggota && createAcaraDto.anggota.length > 0) {
      await this.anggotaAcaraRepository.delete({
        acara: { id: savedAcara.id },
      });

      const anggotaRecords = await Promise.all(
        createAcaraDto.anggota.map(async (anggotaDto, index) => {
          console.log(`Memproses anggota[${index}]:`, anggotaDto);
          const anggotaUser = await this.userRepository.findOne({
            where: { id: anggotaDto.id_user },
          });
          if (!anggotaUser) {
            throw new NotFoundException(
              `Pengguna dengan ID ${anggotaDto.id_user} tidak ditemukan`,
            );
          }
          const nama = await this.getUserName(anggotaUser.id, anggotaUser.role);
          console.log(`Nama untuk pengguna ${anggotaDto.id_user}:`, nama);
          if (!nama) {
            throw new NotFoundException(
              `Profil untuk pengguna ID ${anggotaDto.id_user} tidak ditemukan`,
            );
          }
          if (!anggotaUser.nim) {
            throw new NotFoundException(
              `NIM untuk pengguna ID ${anggotaDto.id_user} tidak ditemukan`,
            );
          }

          let nilai_rata_rata: number | undefined;
          let grade: string | undefined;
          if (
            anggotaDto.kerjasama !== undefined &&
            anggotaDto.kedisiplinan !== undefined &&
            anggotaDto.komunikasi !== undefined &&
            anggotaDto.tanggung_jawab !== undefined
          ) {
            nilai_rata_rata =
              (anggotaDto.kerjasama +
                anggotaDto.kedisiplinan +
                anggotaDto.komunikasi +
                anggotaDto.tanggung_jawab) /
              4;
            grade = this.calculateGrade(nilai_rata_rata);
          }

          const anggotaRecord = this.anggotaAcaraRepository.create({
            acara: savedAcara,
            user: anggotaUser,
            nama,
            nim: anggotaUser.nim,
            jabatan: anggotaDto.jabatan,
            status: 'ABSENT',
            kerjasama: anggotaDto.kerjasama,
            kedisiplinan: anggotaDto.kedisiplinan,
            komunikasi: anggotaDto.komunikasi,
            tanggung_jawab: anggotaDto.tanggung_jawab,
            nilai_rata_rata,
            grade,
          });
          console.log(`Anggota record[${index}]:`, anggotaRecord);
          return anggotaRecord;
        }),
      );
      console.log('Rekaman anggota yang akan disimpan:', anggotaRecords);
      await this.anggotaAcaraRepository.save(anggotaRecords);
    }

    return this.findOne(savedAcara.id);
  }

  async findAll(): Promise<AcaraResponseDto[]> {
    const acaras = await this.acaraRepository.find({
      relations: ['user', 'anggota', 'anggota.user'],
    });

    return Promise.all(
      acaras.map(async (acara) => {
        const creatorName = await this.getUserName(
          acara.user.id,
          acara.user.role,
        );

        const anggotaWithNames = acara.anggota.map((anggota) => ({
          id: anggota.id,
          id_user: anggota.user.id,
          nama: anggota.nama,
          nim: anggota.nim,
          jabatan: anggota.jabatan,
          status: anggota.status,
          kerjasama: anggota.kerjasama,
          kedisiplinan: anggota.kedisiplinan,
          komunikasi: anggota.komunikasi,
          tanggung_jawab: anggota.tanggung_jawab,
          nilai_rata_rata: anggota.nilai_rata_rata,
          grade: anggota.grade,
        }));

        return {
          id: acara.id,
          judul: acara.judul,
          tanggal: acara.tanggal,
          jumlah_panitia: acara.jumlah_panitia,
          skor: acara.skor,
          status: acara.status,
          gambar: acara.gambar ? `/uploads/acara/${acara.gambar}` : undefined,
          deskripsi: acara.deskripsi,
          created_at: acara.created_at,
          updated_at: acara.updated_at,
          created_by: {
            id: acara.user.id,
            nim: acara.user.nim,
            name: creatorName,
            role: acara.user.role,
          },
          anggota: anggotaWithNames,
        };
      }),
    );
  }

  async findOne(id: string): Promise<AcaraResponseDto> {
    const acara = await this.acaraRepository.findOne({
      where: { id },
      relations: ['user', 'anggota', 'anggota.user'],
    });

    if (!acara) {
      throw new NotFoundException(`Acara dengan ID ${id} tidak ditemukan`);
    }

    const creatorName = await this.getUserName(acara.user.id, acara.user.role);

    const anggotaWithNames = acara.anggota
      .filter((anggota) => anggota.nama && anggota.nim)
      .map((anggota) => {
        console.log(`Anggota:`, anggota);
        return {
          id: anggota.id,
          id_user: anggota.user?.id || anggota.id,
          nama: anggota.nama,
          nim: anggota.nim,
          jabatan: anggota.jabatan,
          status: anggota.status,
          kerjasama: anggota.kerjasama,
          kedisiplinan: anggota.kedisiplinan,
          komunikasi: anggota.komunikasi,
          tanggung_jawab: anggota.tanggung_jawab,
          nilai_rata_rata: anggota.nilai_rata_rata,
          grade: anggota.grade,
        };
      });

    return {
      id: acara.id,
      judul: acara.judul,
      tanggal: acara.tanggal,
      jumlah_panitia: acara.jumlah_panitia,
      skor: acara.skor,
      status: acara.status,
      gambar: acara.gambar ? `/uploads/acara/${acara.gambar}` : undefined,
      deskripsi: acara.deskripsi,
      created_at: acara.created_at,
      updated_at: acara.updated_at,
      created_by: {
        id: acara.user.id,
        nim: acara.user.nim,
        name: creatorName,
        role: acara.user.role,
      },
      anggota: anggotaWithNames,
    };
  }

  async update(
    id: string,
    updateAcaraDto: UpdateAcaraDto,
  ): Promise<AcaraResponseDto> {
    const acara = await this.acaraRepository.findOne({
      where: { id },
      relations: ['anggota'],
    });

    if (!acara) {
      throw new NotFoundException(`Acara dengan ID ${id} tidak ditemukan`);
    }

    if (
      updateAcaraDto.gambar &&
      acara.gambar &&
      updateAcaraDto.gambar !== acara.gambar
    ) {
      const oldFilePath = join(process.cwd(), 'Uploads', 'acara', acara.gambar);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
          console.log(`Deleted old file: ${oldFilePath}`);
        } catch (error) {
          console.error(`Failed to delete old file: ${oldFilePath}`, error);
        }
      }
    }

    console.log('Updating acara with gambar:', updateAcaraDto.gambar);

    if (updateAcaraDto.anggota !== undefined) {
      await this.anggotaAcaraRepository.delete({ acara: { id } });
      if (updateAcaraDto.anggota && updateAcaraDto.anggota.length > 0) {
        const anggotaRecords = await Promise.all(
          updateAcaraDto.anggota.map(async (anggotaDto) => {
            const anggotaUser = await this.userRepository.findOne({
              where: { id: anggotaDto.id_user },
            });
            if (!anggotaUser) {
              throw new NotFoundException(
                `Pengguna dengan ID ${anggotaDto.id_user} tidak ditemukan`,
              );
            }
            const nama = await this.getUserName(
              anggotaUser.id,
              anggotaUser.role,
            );
            if (!nama) {
              throw new NotFoundException(
                `Profil untuk pengguna ID ${anggotaDto.id_user} tidak ditemukan`,
              );
            }
            return this.anggotaAcaraRepository.create({
              acara,
              user: anggotaUser,
              nama,
              nim: anggotaUser.nim,
              jabatan: anggotaDto.jabatan,
            });
          }),
        );
        await this.anggotaAcaraRepository.save(anggotaRecords);
      }
    }

    const { anggota, ...otherFields } = updateAcaraDto;
    this.acaraRepository.merge(acara, otherFields);

    await this.acaraRepository.save(acara);

    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const acara = await this.acaraRepository.findOne({ where: { id } });
    if (!acara) {
      throw new NotFoundException(`Acara dengan ID ${id} tidak ditemukan`);
    }

    if (acara.gambar) {
      const filePath = join(process.cwd(), 'Uploads', 'acara', acara.gambar);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        } catch (error) {
          console.error(`Failed to delete file: ${filePath}`, error);
        }
      }
    }

    const result = await this.acaraRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Acara dengan ID ${id} tidak ditemukan`);
    }
    return { message: 'Acara berhasil dihapus' };
  }
}
