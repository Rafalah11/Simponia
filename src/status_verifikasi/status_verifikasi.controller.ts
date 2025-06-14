import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { StatusVerifikasiService } from './status_verifikasi.service';
import { CreateStatusVerifikasiDto } from './dto/create-status_verifikasi.dto';
import { UpdateStatusVerifikasiDto } from './dto/update-status_verifikasi.dto';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interface';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('status-verifikasi')
@UseGuards(AuthGuard('jwt'))
export class StatusVerifikasiController {
  constructor(
    private readonly statusVerifikasiService: StatusVerifikasiService,
  ) {}

  @Post()
  create(
    @Body() createStatusVerifikasiDto: CreateStatusVerifikasiDto,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Hanya Admin yang dapaat Mengakses fitur ini!',
      );
    }
    return this.statusVerifikasiService.create(createStatusVerifikasiDto);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    // if (req.user.role !== UserRole.ADMIN) {
    //   throw new ForbiddenException(
    //     'Hanya Admin yang dapaat Mengakses fitur ini!',
    //   );
    // }
    return this.statusVerifikasiService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const uniqueId = parseInt(id, 10); // Konversi string ke number
    if (isNaN(uniqueId)) {
      throw new NotFoundException('ID harus berupa angka');
    }
    const result = await this.statusVerifikasiService.findOne(uniqueId);
    if (!result) {
      throw new NotFoundException(
        `Status verifikasi dengan ID ${uniqueId} tidak ditemukan`,
      );
    }
    return result;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStatusVerifikasiDto: UpdateStatusVerifikasiDto,
    @Req() req: AuthRequest,
  ) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException(
        'Hanya Admin atau Admin Community yang dapat mengakses fitur ini!',
      );
    }
    const uniqueId = parseInt(id, 10);
    if (isNaN(uniqueId)) {
      throw new NotFoundException('ID harus berupa angka');
    }
    const result = await this.statusVerifikasiService.update(
      uniqueId,
      updateStatusVerifikasiDto,
    );
    if (!result) {
      throw new NotFoundException(
        `Status verifikasi dengan ID ${uniqueId} tidak ditemukan`,
      );
    }
    return result;
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.statusVerifikasiService.remove(+id);
  // }
}
