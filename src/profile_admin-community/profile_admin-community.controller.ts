import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProfileAdminCommunityService } from './profile_admin-community.service';
import { CreateProfileAdminCommunityDto } from './dto/create-profile_admin-community.dto';
import { UpdateProfileAdminCommunityDto } from './dto/update-profile_admin-community.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interface';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('profile-admin-community')
@UseGuards(AuthGuard('jwt'))
export class ProfileAdminCommunityController {
  constructor(
    private readonly profileAdminCommunityService: ProfileAdminCommunityService,
  ) {}

  @Post()
  create(
    @Body() createProfileAdminCommunityDto: CreateProfileAdminCommunityDto,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN_COMMUNITY) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses untuk membuat data sendiri',
      );
    }

    const newProfileDto = {
      ...createProfileAdminCommunityDto,
      user_id: req.user.id, // auto isi dari token
    };

    return this.profileAdminCommunityService.create(newProfileDto);
  }

  @Post(':id')
  createWithId(
    @Body() createProfileAdminCommunityDto: CreateProfileAdminCommunityDto,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Hanya Admin yang dapat menambahkan data untuk user lain',
      );
    }

    // Pastikan body mengandung `user_id`
    if (!createProfileAdminCommunityDto.user_id) {
      throw new ForbiddenException('user_id harus disertakan');
    }

    return this.profileAdminCommunityService.create(
      createProfileAdminCommunityDto,
    );
  }

  @Get()
  async getmyProfile(@Req() req: AuthRequest) {
    if (req.user.role === UserRole.ADMIN) {
      // Role 1: ADMIN - bisa lihat semua data
      return this.profileAdminCommunityService.findAll();
    }

    if (req.user.role === UserRole.ADMIN_COMMUNITY) {
      // Role 2: ADMIN_COMMUNITY - hanya bisa lihat profile sendiri
      const profile = await this.profileAdminCommunityService.findByUserId(
        req.user.id,
      );
      if (!profile) {
        throw new NotFoundException('Anda belum memiliki Profile');
      }
      return profile;
    }

    // Role lain (misal USER) - tidak punya akses
    throw new ForbiddenException('Anda tidak memiliki akses ke sini');
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    const profile = await this.profileAdminCommunityService.findOne(id);

    if (!profile) {
      throw new NotFoundException('Profile tidak ditemukan');
    }

    // Role 3 (USER / MAHASISWA) tidak punya akses
    if (req.user.role === UserRole.MAHASISWA) {
      throw new ForbiddenException('Anda tidak memiliki akses ke sini');
    }

    // Role 2 (ADMIN_COMMUNITY) hanya bisa akses miliknya sendiri
    if (
      req.user.role === UserRole.ADMIN_COMMUNITY &&
      profile.user.id !== req.user.id
    ) {
      throw new ForbiddenException(
        'Anda hanya bisa mengakses data milik Anda sendiri',
      );
    }

    // Role 1 (ADMIN) bebas akses siapa saja
    return profile;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProfileAdminCommunityDto: UpdateProfileAdminCommunityDto,
    @Req() req: AuthRequest,
  ) {
    const profile = await this.profileAdminCommunityService.findOne(id);
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses');
    }
    if (req.user.role !== UserRole.ADMIN && profile.user.id !== req.user.id) {
      throw new ForbiddenException('Anda hanya bisa mengupdate data sendiri');
    }
    const updatedto = {
      ...updateProfileAdminCommunityDto,
      user_id: profile.user.id,
    };
    return this.profileAdminCommunityService.update(id, updatedto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Hanya admin yang dapat menghapus Profile');
    }
    return this.profileAdminCommunityService.remove(id);
  }
}

export class RoleForbiddenException extends ForbiddenException {
  constructor(requiredRoles: string[]) {
    super({
      statusCode: 403,
      message: 'Akses ditolak',
      error: `Hanya role berikut yang diperbolehkan: ${requiredRoles.join(', ')}`,
    });
  }
}
