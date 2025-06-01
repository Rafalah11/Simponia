import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
  Catch,
  UnauthorizedException,
  HttpException,
  ArgumentsHost,
  ExceptionFilter,
  UseFilters,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PortofolioService } from './portofolio.service';
import { UserService } from '../user/user.service';
import { CreatePortofolioDto } from './dto/create-portofolio.dto';
import { UpdatePortofolioDto } from './dto/update-portofolio.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interface';
import { Response } from 'express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

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

@Controller('portofolio')
@UseGuards(AuthGuard('jwt'))
@UseFilters(new UnauthorizedExceptionFilter())
export class PortofolioController {
  constructor(
    private readonly portofolioService: PortofolioService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('gambar', multerConfig('portofolio')))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePortofolioDto })
  async create(
    @Body() createPortofolioDto: CreatePortofolioDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    const newPortofolioDto: CreatePortofolioDto = {
      ...createPortofolioDto,
      gambar: file ? file.filename : undefined, // Simpan nama file jika ada
    };
    return this.portofolioService.create(newPortofolioDto, req.user.id);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.portofolioService.findAll();
  }

  @Get('user')
  async findAllUsers() {
    try {
      const users = await this.userService.findAll();
      if (!users || users.length === 0) {
        throw new NotFoundException('Tidak ada data pengguna ditemukan');
      }
      return users;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException({
          statusCode: 404,
          message: error.message,
          error: 'Not Found',
        });
      }
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const portofolio = await this.portofolioService.findOne(id);
      if (!portofolio) {
        throw new NotFoundException(`Portofolio with ID ${id} not found`);
      }
      return portofolio;
    } catch (error) {
      throw new NotFoundException(`Portofolio with ID ${id} not found`);
    }
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('gambar', multerConfig('portofolio')))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdatePortofolioDto })
  async update(
    @Param('id') id: string,
    @Body() updatePortofolioDto: UpdatePortofolioDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    const updatedDto: UpdatePortofolioDto = {
      ...updatePortofolioDto,
      gambar: file ? file.filename : updatePortofolioDto.gambar, // Gunakan file baru jika ada
    };
    return this.portofolioService.update(id, updatedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.portofolioService.remove(id);
  }
}
