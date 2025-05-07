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
} from '@nestjs/common';
import { ProfileUserService } from './profile_user.service';
import { CreateProfileUserDto } from './dto/create-profile_user.dto';
import { UpdateProfileUserDto } from './dto/update-profile_user.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { User, UserRole } from 'src/user/entities/user.entity';

@Controller('profile-user')
@UseGuards(AuthGuard('jwt'))
export class ProfileUserController {
  constructor(private readonly profileUserService: ProfileUserService) {}

  @Post()
  async create(
    @Body() createProfileUserDto: CreateProfileUserDto,
    @Req() req: AuthRequest,
  ) {
    // Pastikan hanya mahasiswa yang bisa membuat profile
    if (req.user.role !== UserRole.MAHASISWA) {
      throw new ForbiddenException('Hanya mahasiswa yang bisa membuat profile');
    }

    const newProfileDto = {
      ...createProfileUserDto,
      user_id: req.user.id,
    };

    return this.profileUserService.create(newProfileDto);
  }

  @Post(':id')
  async createWithId(
    @Body() createProfileUserDto: CreateProfileUserDto,
    @Req() req: AuthRequest,
  ) {
    // Pastikan hanya mahasiswa yang bisa membuat profile
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Hanya ADMIN yang bisa membuat profile');
    }

    const newProfileDto = {
      ...createProfileUserDto,
      user_id: req.user.id,
    };

    return this.profileUserService.create(newProfileDto);
  }

  @Get()
  async getMyProfile(@Req() req: AuthRequest) {
    if (req.user.role === UserRole.ADMIN_COMMUNITY) {
      throw new ForbiddenException(
        'Hanya Mahasiswa yang dapat menampilkan informasi ini',
      );
    }
    if (req.user.role === UserRole.ADMIN) {
      // Role 1: ADMIN - bisa lihat semua data
      return this.profileUserService.findAll();
    }
    const profile = await this.profileUserService.findByUserId(req.user.id);
    if (!profile) {
      throw new NotFoundException('Anda belum memiliki profile');
    }

    return profile;
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    const profile = await this.profileUserService.findOne(id);

    // Admin bisa melihat semua profile
    if (req.user.role !== UserRole.ADMIN && profile.user.id !== req.user.id) {
      throw new ForbiddenException('Anda hanya bisa mengakses data sendiri');
    }

    return profile;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProfileUserDto: UpdateProfileUserDto,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role === UserRole.ADMIN_COMMUNITY) {
      throw new ForbiddenException(
        'Hanya Mahasiswa yang dapat menampilkan informasi ini',
      );
    }
    const existingProfile = await this.profileUserService.findOne(id);

    // Hanya admin atau pemilik profile yang bisa update
    if (
      req.user.role !== UserRole.ADMIN &&
      existingProfile.user.id !== req.user.id
    ) {
      throw new ForbiddenException('Anda hanya bisa mengupdate data sendiri');
    }

    const updatedDto = {
      ...updateProfileUserDto,
      user_id: existingProfile.user.id, // Pastikan user_id tidak berubah
    };

    return this.profileUserService.update(id, updatedDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthRequest) {
    const existingProfile = await this.profileUserService.findOne(id);

    // Hanya admin yang bisa menghapus profile
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Hanya admin yang bisa menghapus profile');
    }

    return this.profileUserService.remove(id);
  }
}
