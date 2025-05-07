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
} from '@nestjs/common';
import { AcaraService } from './acara.service';
import { CreateAcaraDto } from './dto/create-acara.dto';
import { UpdateAcaraDto } from './dto/update-acara.dto';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interface';
import { UserRole } from 'src/user/entities/user.entity';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

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
  create(@Body() createAcaraDto: CreateAcaraDto, @Req() req: AuthRequest) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }

    // Tambahkan user_id dari token ke DTO
    const newAcaraDto = {
      ...createAcaraDto,
      id_user: req.user.id, // Sesuaikan dengan field yang dibutuhkan
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
  update(
    @Param('id') id: string,
    @Body() updateAcaraDto: UpdateAcaraDto,
    @Req() req: AuthRequest,
  ) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }
    const updateeAcaraDto = {
      ...updateAcaraDto,
      id_user: req.user.id, // Sesuaikan dengan field yang dibutuhkan
    };
    return this.acaraService.update(id, updateeAcaraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.ADMIN_COMMUNITY
    ) {
      throw new ForbiddenException('Anda tidak memiliki akses fitur ini');
    }
    return this.acaraService.remove(id);
  }
}
