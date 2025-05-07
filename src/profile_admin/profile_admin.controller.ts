import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Req,
  NotFoundException,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ProfileAdminService } from './profile_admin.service';
import { CreateProfileAdminDto } from './dto/create-profile_admin.dto';
import { UpdateProfileAdminDto } from './dto/update-profile_admin.dto';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interface';
import { AuthGuard } from '@nestjs/passport';
import { User, UserRole } from 'src/user/entities/user.entity';

@Controller('profile-admin')
@UseGuards(AuthGuard('jwt'))
export class ProfileAdminController {
  constructor(private readonly profileAdminService: ProfileAdminService) {}

  @Post()
  create(
    @Body() createProfileAdminDto: CreateProfileAdminDto,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Hanya Admin yang dapat membuat profile');
    }
    const newAdminDto = {
      ...createProfileAdminDto,
      user_id: req.user.id,
    };
    return this.profileAdminService.create(newAdminDto);
  }

  @Get()
  async getMyProfileAdmin(@Req() req: AuthRequest) {
    const profileAdmin = await this.profileAdminService.findByUserId(
      req.user.id,
    );
    if (!profileAdmin) {
      throw new NotFoundException('Anda belum memiliki Profile');
    }
    return profileAdmin;
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Hanya admin yang dapat mengakses ini');
    }
    return this.profileAdminService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateProfileAdminDto: UpdateProfileAdminDto,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Hanya Admin yang dapat Mengakses fitur ini',
      );
    }
    return this.profileAdminService.update(id, updateProfileAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Hanya admin yang dapat mengakses fitur ini',
      );
    }
    return this.profileAdminService.remove(id);
  }
}
