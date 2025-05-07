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
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Hanya Admin yang dapaat Mengakses fitur ini!',
      );
    }
    return this.statusVerifikasiService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.statusVerifikasiService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateStatusVerifikasiDto: UpdateStatusVerifikasiDto) {
  //   return this.statusVerifikasiService.update(+id, updateStatusVerifikasiDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.statusVerifikasiService.remove(+id);
  // }
}
