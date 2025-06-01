import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Catch,
  UnauthorizedException,
  HttpException,
  ExceptionFilter,
  ArgumentsHost,
  UseGuards,
  UseFilters,
  Req,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AcaraService } from './acara.service';
import { CreateAcaraDto } from './dto/create-acara.dto';
import { UpdateAcaraDto } from './dto/update-acara.dto';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interface';
import { UserRole } from 'src/user/entities/user.entity';
import { multerConfig } from '../config/multer.config';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(_exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(401).json({
      statusCode: 401,
      message: 'Anda belum login / tidak memiliki token',
    });
  }
}

@Controller('acara')
@UseGuards(AuthGuard('jwt'))
@UseFilters(new UnauthorizedExceptionFilter())
export class AcaraController {
  constructor(private readonly acaraService: AcaraService) {}

  @Post()
  @UseInterceptors(FileInterceptor('gambar', multerConfig('acara')))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateAcaraDto })
  async create(
    @Body() createAcaraDto: CreateAcaraDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }

    // Parse anggota if provided as a JSON string
    if (createAcaraDto.anggota && typeof createAcaraDto.anggota === 'string') {
      try {
        createAcaraDto.anggota = JSON.parse(createAcaraDto.anggota);
      } catch (error) {
        throw new BadRequestException(
          'Invalid anggota format. Must be a valid JSON array.',
        );
      }
    }

    // Validate anggota array
    if (createAcaraDto.anggota) {
      createAcaraDto.anggota.forEach((anggota, index) => {
        if (!anggota.id_user || !anggota.jabatan) {
          throw new BadRequestException(
            `Anggota at index ${index} is missing id_user or jabatan.`,
          );
        }
      });
    }

    // Log file upload
    console.log('Uploaded file:', file);

    // Add user_id from token and filename if file is uploaded
    const newAcaraDto = {
      ...createAcaraDto,
      id_user: req.user.id,
      gambar: file ? file.filename : undefined,
    };

    return this.acaraService.create(newAcaraDto);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }
    return this.acaraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }
    return this.acaraService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('gambar', multerConfig('acara')))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateAcaraDto })
  async update(
    @Param('id') id: string,
    @Body() updateAcaraDto: UpdateAcaraDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }

    // Parse anggota if provided as a JSON string
    if (updateAcaraDto.anggota && typeof updateAcaraDto.anggota === 'string') {
      try {
        updateAcaraDto.anggota = JSON.parse(updateAcaraDto.anggota);
      } catch (error) {
        throw new BadRequestException(
          'Invalid anggota format. Must be a valid JSON array.',
        );
      }
    }

    // Log file upload
    console.log('Uploaded file for update:', file);

    // Add user_id from token and filename if file is uploaded
    const updatedAcaraDto = {
      ...updateAcaraDto,
      id_user: req.user.id,
      gambar: file ? file.filename : updateAcaraDto.gambar,
    };

    return this.acaraService.update(id, updatedAcaraDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthRequest) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }
    return this.acaraService.remove(id);
  }
}
