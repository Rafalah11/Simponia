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
import { ProfileAdminService } from './profile_admin.service';
import { CreateProfileAdminDto } from './dto/create-profile_admin.dto';
import { UpdateProfileAdminDto } from './dto/update-profile_admin.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interface';
import { UserRole } from 'src/user/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

@Controller('profile-admin')
@UseGuards(AuthGuard('jwt'))
export class ProfileAdminController {
  constructor(private readonly profileAdminService: ProfileAdminService) {}

  @Post()
  @UseInterceptors(FileInterceptor('profilePicture', multerConfig('admin'))) // Gunakan folder 'admin'
  create(
    @Body() createProfileAdminDto: CreateProfileAdminDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Hanya Admin yang dapat membuat profile');
    }

    const newAdminDto: CreateProfileAdminDto = {
      ...createProfileAdminDto,
      user_id: req.user.id,
      profilePicture: file,
      tanggalLahir: new Date(createProfileAdminDto.tanggalLahir),
    };

    return this.profileAdminService.create(newAdminDto);
  }

  @Get()
  async getMyProfileAdmin(@Req() req: AuthRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Hanya Admin yang dapat mengakses ini');
    }

    const profileAdmin = await this.profileAdminService.findByUserId(
      req.user.id,
    );
    if (!profileAdmin) {
      throw new NotFoundException('Anda belum memiliki Profile');
    }
    return profileAdmin;
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Hanya admin yang dapat mengakses ini');
    }
    const profile = await this.profileAdminService.findOne(id);
    if (!profile) {
      throw new NotFoundException('Profile tidak ditemukan');
    }
    return profile;
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('profilePicture', multerConfig('admin'))) // Gunakan folder 'admin'
  async update(
    @Param('id') id: string,
    @Body() updateProfileAdminDto: UpdateProfileAdminDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Hanya Admin yang dapat mengakses fitur ini',
      );
    }

    const existingProfile = await this.profileAdminService.findOne(id);
    if (!existingProfile) {
      throw new NotFoundException('Profile tidak ditemukan');
    }

    const updatedDto: UpdateProfileAdminDto = {
      ...updateProfileAdminDto,
      user_id: existingProfile.user.id,
      profilePicture: file,
      tanggalLahir: updateProfileAdminDto.tanggalLahir
        ? new Date(updateProfileAdminDto.tanggalLahir)
        : undefined,
    };

    return this.profileAdminService.update(id, updatedDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Hanya admin yang dapat mengakses fitur ini',
      );
    }
    return this.profileAdminService.remove(id);
  }
}
