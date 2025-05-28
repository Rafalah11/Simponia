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
import { ProfileUser } from '../profile_user/entities/profile_user.entity';
import { ProfileAdmin } from '../profile_admin/entities/profile_admin.entity';
import { ProfileAdminCommunity } from '../profile_admin-community/entities/profile_admin-community.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProfileUser)
    private readonly profileUserRepository: Repository<ProfileUser>,
    @InjectRepository(ProfileAdmin)
    private readonly profileAdminRepository: Repository<ProfileAdmin>,
    @InjectRepository(ProfileAdminCommunity)
    private readonly profileAdminCommunityRepository: Repository<ProfileAdminCommunity>,
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

  async findAll() {
    const users = await this.userRepository.find();
    // Tambahkan nama ke setiap pengguna
    return Promise.all(
      users.map(async (user) => {
        const name = await this.getUserName(user.id, user.role);
        return {
          id: user.id,
          nim: user.nim,
          role: user.role,
          name, // Tambahkan nama dari profil
        };
      }),
    );
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
