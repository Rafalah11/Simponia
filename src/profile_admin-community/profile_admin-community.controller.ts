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
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller('profile-admin-community')
@UseGuards(AuthGuard('jwt'))
export class ProfileAdminCommunityController {
  constructor(
    private readonly profileAdminCommunityService: ProfileAdminCommunityService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('profilePicture', multerConfig('admin-community')),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProfileAdminCommunityDto })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: CreateProfileAdminCommunityDto,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN_COMMUNITY) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses untuk membuat data pada fitur ini',
      );
    }

    const newProfileDto: CreateProfileAdminCommunityDto = {
      ...createDto,
      user_id: req.user.id,
      profilePicture: file,
    };

    return this.profileAdminCommunityService.create(newProfileDto);
  }

  @Post(':id')
  @UseInterceptors(FileInterceptor('profilePicture', multerConfig('admin')))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProfileAdminCommunityDto })
  async createWithId(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: CreateProfileAdminCommunityDto,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException(
        'Hanya Admin yang dapat menambahkan data untuk user lain',
      );
    }

    if (!createDto.user_id || createDto.user_id !== id) {
      throw new BadRequestException('user_id harus sesuai dengan parameter id');
    }

    const newProfileDto: CreateProfileAdminCommunityDto = {
      ...createDto,
      profilePicture: file,
    };

    return this.profileAdminCommunityService.create(newProfileDto);
  }

  @Get()
  async getMyProfile(@Req() req: AuthRequest) {
    if (req.user.role === UserRole.ADMIN) {
      return this.profileAdminCommunityService.findAll();
    }

    if (req.user.role === UserRole.ADMIN_COMMUNITY) {
      const profile = await this.profileAdminCommunityService.findByUserId(
        req.user.id,
      );
      if (!profile) {
        throw new NotFoundException('Anda belum memiliki profile');
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
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProfileAdminCommunityDto })
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateDto: UpdateProfileAdminCommunityDto,
    @Req() req: AuthRequest,
  ) {
    console.log('req.user:', req.user);
    console.log('updateDto:', updateDto);
    const profile = await this.profileAdminCommunityService.findOne(id);

    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses');
    }

    if (
      req.user.role === UserRole.ADMIN_COMMUNITY &&
      profile.user.id !== req.user.id
    ) {
      throw new ForbiddenException('Anda hanya bisa mengupdate data sendiri');
    }

    const updatedData: UpdateProfileAdminCommunityDto = {
      ...updateDto,
      profilePicture: file,
    };

    return this.profileAdminCommunityService.update(id, updatedData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Hanya Admin yang dapat menghapus profile');
    }
    return this.profileAdminCommunityService.remove(id);
  }
}
