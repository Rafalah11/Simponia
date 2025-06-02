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
} from '@nestjs/common';
import { ProfileUserService } from './profile_user.service';
import { CreateProfileUserDto } from './dto/create-profile_user.dto';
import { UpdateProfileUserDto } from './dto/update-profile_user.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { UserRole } from 'src/user/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

@Controller('profile-user')
@UseGuards(AuthGuard('jwt'))
export class ProfileUserController {
  constructor(private readonly profileUserService: ProfileUserService) {}

  @Post()
  @UseInterceptors(FileInterceptor('profilePicture', multerConfig('user')))
  async create(
    @Body() FormData: CreateProfileUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== UserRole.MAHASISWA) {
      throw new ForbiddenException('Hanya mahasiswa yang bisa membuat profile');
    }

    const createProfileDto: CreateProfileUserDto = {
      ...FormData,
      user_id: req.user.id,
      tanggalLahir: new Date(FormData.tanggalLahir),
      profilePicture: file, // Gunakan file langsung
    };

    return this.profileUserService.create(createProfileDto);
  }

  @Post(':id')
  @UseInterceptors(FileInterceptor('profilePicture', multerConfig('user')))
  async createWithId(
    @Body() createProfileUserDto: CreateProfileUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Hanya ADMIN yang bisa membuat profile');
    }

    const newProfileDto = {
      ...createProfileUserDto,
      profilePicture: file,
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

    if (req.user.role !== UserRole.ADMIN && profile.user.id !== req.user.id) {
      throw new ForbiddenException('Anda hanya bisa mengakses data sendiri');
    }

    return profile;
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('profilePicture', multerConfig('user')))
  async update(
    @Param('id') id: string,
    @Body() updateProfileUserDto: UpdateProfileUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role === UserRole.ADMIN_COMMUNITY) {
      throw new ForbiddenException(
        'Hanya Mahasiswa yang dapat menampilkan informasi ini',
      );
    }

    const existingProfile = await this.profileUserService.findOne(id);

    if (
      req.user.role !== UserRole.ADMIN &&
      existingProfile.user.id !== req.user.id
    ) {
      throw new ForbiddenException('Anda hanya bisa mengupdate data sendiri');
    }

    const updatedDto: UpdateProfileUserDto = {
      ...updateProfileUserDto,
      user_id: existingProfile.user.id,
      profilePicture: file ? file.filename : undefined, // Gunakan filename dari file
    };

    return this.profileUserService.update(id, updatedDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthRequest) {
    const existingProfile = await this.profileUserService.findOne(id);

    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Hanya admin yang bisa menghapus profile');
    }

    return this.profileUserService.remove(id);
  }
}
