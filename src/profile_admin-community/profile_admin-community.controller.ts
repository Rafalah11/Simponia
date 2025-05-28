import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ProfileAdminCommunityService } from './profile_admin-community.service';
import { CreateProfileAdminCommunityDto } from './dto/create-profile_admin-community.dto';
import { UpdateProfileAdminCommunityDto } from './dto/update-profile_admin-community.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interface';
import { UserRole } from 'src/user/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

@Controller('profile-admin-community')
@UseGuards(AuthGuard('jwt'))
export class ProfileAdminCommunityController {
  constructor(
    private readonly profileAdminCommunityService: ProfileAdminCommunityService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('profilePicture', multerConfig('admin-community')),
  ) // Gunakan folder 'admin-community'
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: CreateProfileAdminCommunityDto,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN_COMMUNITY) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses untuk membuat data sendiri',
      );
    }

    const newProfileDto: CreateProfileAdminCommunityDto = {
      ...createDto,
      user_id: req.user.id,
      profilePicture: file,
      tanggalLahir: new Date(createDto.tanggalLahir),
    };

    return this.profileAdminCommunityService.create(newProfileDto);
  }

  @Post(':id')
  @UseInterceptors(
    FileInterceptor('profilePicture', multerConfig('admin-community')),
  ) // Gunakan folder 'admin-community'
  async createWithId(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: CreateProfileAdminCommunityDto,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Hanya Admin yang dapat menambahkan data untuk user lain',
      );
    }

    if (!createDto.user_id || createDto.user_id !== id) {
      throw new BadRequestException('user_id harus sesuai dengan parameter id');
    }

    const newProfileDto: CreateProfileAdminCommunityDto = {
      ...createDto,
      profilePicture: file,
      tanggalLahir: new Date(createDto.tanggalLahir),
    };

    return this.profileAdminCommunityService.create(newProfileDto);
  }

  @Get()
  async getmyProfile(@Req() req: AuthRequest) {
    if (req.user.role === UserRole.ADMIN) {
      return this.profileAdminCommunityService.findAll();
    }

    if (req.user.role === UserRole.ADMIN_COMMUNITY) {
      const profile = await this.profileAdminCommunityService.findByUserId(
        req.user.id,
      );
      if (!profile) {
        throw new NotFoundException('Anda belum memiliki Profile');
      }
      return profile;
    }

    throw new ForbiddenException('Anda tidak memiliki akses ke sini');
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    const profile = await this.profileAdminCommunityService.findOne(id);

    if (!profile) {
      throw new NotFoundException('Profile tidak ditemukan');
    }

    if (req.user.role === UserRole.MAHASISWA) {
      throw new ForbiddenException('Anda tidak memiliki akses ke sini');
    }

    if (
      req.user.role === UserRole.ADMIN_COMMUNITY &&
      profile.user.id !== req.user.id
    ) {
      throw new ForbiddenException(
        'Anda hanya bisa mengakses data milik Anda sendiri',
      );
    }

    return profile;
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('profilePicture', multerConfig('admin-community')),
  ) // Gunakan folder 'admin-community'
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateDto: UpdateProfileAdminCommunityDto,
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

    const updatedData: UpdateProfileAdminCommunityDto = {
      ...updateDto,
      user_id: profile.user.id,
      profilePicture: file,
      tanggalLahir: updateDto.tanggalLahir
        ? new Date(updateDto.tanggalLahir)
        : undefined,
    };

    return this.profileAdminCommunityService.update(id, updatedData);
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
