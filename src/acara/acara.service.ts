import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Acara } from './entities/acara.entity';
import { CreateAcaraDto } from './dto/create-acara.dto';
import { UpdateAcaraDto } from './dto/update-acara.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AcaraService {
  constructor(
    @InjectRepository(Acara)
    private acaraRepository: Repository<Acara>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createAcaraDto: CreateAcaraDto): Promise<Acara> {
    // Validasi user
    const user = await this.userRepository.findOne({
      where: { id: createAcaraDto.id_user },
    });
    const ketuaPelaksana = await this.userRepository.findOne({
      where: { id: createAcaraDto.ketua_pelaksana },
    });

    if (!user || !ketuaPelaksana) {
      throw new NotFoundException('User or Ketua Pelaksana not found');
    }

    const acara = this.acaraRepository.create({
      ...createAcaraDto,
      user,
      ketua_pelaksana: ketuaPelaksana,
    });

    return this.acaraRepository.save(acara);
  }

  async findAll(): Promise<Acara[]> {
    return this.acaraRepository.find({
      relations: ['user', 'ketua_pelaksana'],
    });
  }

  async findOne(id: string): Promise<Acara> {
    const acara = await this.acaraRepository.findOne({
      where: { id },
      relations: ['user', 'ketua_pelaksana'],
    });

    if (!acara) {
      throw new NotFoundException(`Acara with ID ${id} not found`);
    }

    return acara;
  }

  async update(id: string, updateAcaraDto: UpdateAcaraDto): Promise<Acara> {
    const acara = await this.findOne(id);

    // Validasi ketua pelaksana jika diupdate
    if (updateAcaraDto.ketua_pelaksana) {
      const ketuaPelaksana = await this.userRepository.findOne({
        where: { id: updateAcaraDto.ketua_pelaksana },
      });
      if (!ketuaPelaksana) {
        throw new NotFoundException('Ketua Pelaksana not found');
      }
      acara.ketua_pelaksana = ketuaPelaksana;
    }

    const { ketua_pelaksana, ...otherFields } = updateAcaraDto;
    this.acaraRepository.merge(acara, otherFields);

    return this.acaraRepository.save(acara);
  }

  async remove(id: string): Promise<void> {
    const result = await this.acaraRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Acara with ID ${id} not found`);
    }
  }
}
