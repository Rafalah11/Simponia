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
} from '@nestjs/common';
import { PortofolioService } from './portofolio.service';
import { UserService } from '../user/user.service'; // Tambahkan import UserService
import { CreatePortofolioDto } from './dto/create-portofolio.dto';
import { UpdatePortofolioDto } from './dto/update-portofolio.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interface';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(_exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Kembalikan respons kustom
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
    private readonly userService: UserService, // Tambahkan UserService ke constructor
  ) {}

  @Post()
  create(
    @Body() createPortofolioDto: CreatePortofolioDto,
    @Req() req: AuthRequest,
  ) {
    const newPortofolioDto = {
      ...createPortofolioDto,
      user_id: req.user.id,
    };
    return this.portofolioService.create(newPortofolioDto);
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
  update(
    @Param('id') id: string,
    @Body() updatePortofolioDto: UpdatePortofolioDto,
    @Req() req: AuthRequest,
  ) {
    return this.portofolioService.update(id, updatePortofolioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.portofolioService.remove(id);
  }
}
