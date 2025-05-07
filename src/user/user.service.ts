import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // Cek apakah NIM sudah terdaftar
      const existingUser = await this.userRepository.findOne({
        where: { nim: createUserDto.nim },
      });

      if (existingUser) {
        throw new ConflictException('NIM sudah terdaftar');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );

      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(user);
      const { password, ...result } = savedUser;
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const users = await this.userRepository.find();
      if (users.length === 0) {
        throw new NotFoundException('Tidak ada user yang ditemukan');
      }
      return users.map((user) => {
        const { password, ...result } = user;
        return result;
      });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
      }
      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      // Jika ada password, hash terlebih dahulu
      if (updateUserDto.password) {
        const saltRounds = 10;
        updateUserDto.password = await bcrypt.hash(
          updateUserDto.password,
          saltRounds,
        );
      }

      // Pastikan role valid jika ada
      if (
        updateUserDto.role &&
        !Object.values(UserRole).includes(updateUserDto.role)
      ) {
        throw new BadRequestException(
          'Role tidak valid. Role yang valid adalah: ' +
            Object.values(UserRole).join(', '),
        );
      }

      const result = await this.userRepository.update(id, updateUserDto);
      if (result.affected === 0) {
        throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
      }
      return this.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
      }
      await this.userRepository.remove(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async findByNim(nim: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { nim },
        select: ['id', 'nim', 'password', 'role'], // Hanya pilih field yang diperlukan
      });
    } catch (error) {
      throw error;
    }
  }
}
