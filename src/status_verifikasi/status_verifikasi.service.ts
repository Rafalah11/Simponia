import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusVerifikasi } from './entities/status_verifikasi.entity';
import { CreateStatusVerifikasiDto } from './dto/create-status_verifikasi.dto';
import { UpdateStatusVerifikasiDto } from './dto/update-status_verifikasi.dto';
import { Portofolio } from '../portofolio/entities/portofolio.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class StatusVerifikasiService {
  constructor(
    @InjectRepository(StatusVerifikasi)
    private readonly statusVerifikasiRepo: Repository<StatusVerifikasi>,
    @InjectRepository(Portofolio)
    private readonly portofolioRepo: Repository<Portofolio>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createStatusVerifikasiDto: CreateStatusVerifikasiDto) {
    // Pastikan portofolio dengan id_portofolio ada
    const portofolio = await this.portofolioRepo.findOneBy({
      id: createStatusVerifikasiDto.id_portofolio,
    });
    if (!portofolio) {
      throw new NotFoundException('Portofolio not found');
    }

    // Pastikan user dengan updated_by ada
    const user = await this.userRepo.findOneBy({
      id: createStatusVerifikasiDto.updated_by,
    });
    if (!user) {
      throw new NotFoundException('User not found');
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
    });

    return this.statusVerifikasiRepo.save(statusVerifikasi);
  }

  findAll() {
    return this.statusVerifikasiRepo.find({
      relations: ['portofolio', 'updatedBy'],
    });
  }

  findOne(id: number) {
    return this.statusVerifikasiRepo.findOne({
      where: { UniqueID: id },
      relations: ['portofolio', 'updatedBy'],
    });
  }

  async update(
    id: number,
    updateStatusVerifikasiDto: UpdateStatusVerifikasiDto,
  ) {
    const statusVerifikasi = await this.statusVerifikasiRepo.findOneBy({
      UniqueID: id,
    });
    if (!statusVerifikasi) {
      throw new NotFoundException('Status verifikasi not found');
    }

    // Update status portofolio jika disediakan
    if (updateStatusVerifikasiDto.status) {
      await this.portofolioRepo.update(statusVerifikasi.id_portofolio, {
        status: updateStatusVerifikasiDto.status,
      });
    }

    return this.statusVerifikasiRepo.update(id, {
      note: updateStatusVerifikasiDto.note,
      updated_by: updateStatusVerifikasiDto.updated_by,
    });
  }

  remove(id: number) {
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
