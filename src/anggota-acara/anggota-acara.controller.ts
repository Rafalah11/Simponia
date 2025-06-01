import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  UseFilters,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AnggotaAcaraService } from './anggota-acara.service';
import { CreateAnggotaAcaraDto } from './dto/create-anggota-acara.dto';
import { UpdateAnggotaAcaraDto } from './dto/update-anggota-acara.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { UserRole } from '../user/entities/user.entity';
import { UnauthorizedExceptionFilter } from '../acara/acara.controller';

@Controller('anggota-acara')
@UseGuards(AuthGuard('jwt'))
@UseFilters(new UnauthorizedExceptionFilter())
export class AnggotaAcaraController {
  constructor(private readonly anggotaAcaraService: AnggotaAcaraService) {}

  @Post()
  create(
    @Body() createAnggotaAcaraDto: CreateAnggotaAcaraDto,
    @Req() req: AuthRequest,
  ) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }
    return this.anggotaAcaraService.create(createAnggotaAcaraDto, req);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }
    return this.anggotaAcaraService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }
    return this.anggotaAcaraService.findOne(id, req);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateAnggotaAcaraDto: UpdateAnggotaAcaraDto,
    @Req() req: AuthRequest,
  ) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }
    return this.anggotaAcaraService.update(id, updateAnggotaAcaraDto, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }
    return this.anggotaAcaraService.remove(id, req);
  }
}
