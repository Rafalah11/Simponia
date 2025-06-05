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
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from './entities/user.entity';

@Controller('user')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.create(createUserDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Gagal membuat user: ' + error.message,
          error: 'Bad Request',
        });
      }
      throw error;
    }
  }

  @Get()
  async getDatabyUser(@Req() req) {
    try {
      const user = await this.userService.findOne(req.user.id);
      if (!user) {
        throw new NotFoundException('Super Admin tidak ditemukan');
      }
      return user;
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

  @Get('users')
  async findAll(@Req() req) {
    try {
      if (req.user.role !== UserRole.ADMIN) {
        throw new ForbiddenException({
          statusCode: 403,
          message: 'Anda tidak memiliki hak akses ke fitur ini',
          error: 'Forbidden',
        });
      }
      return await this.userService.findAll();
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException({
          statusCode: 403,
          message: error.message,
          error: 'Forbidden',
        });
      }
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
  async findOne(@Param('id') id: string, @Req() req) {
    try {
      if (req.user.role !== UserRole.ADMIN && req.user.id !== id) {
        throw new ForbiddenException({
          statusCode: 403,
          message: 'Anda hanya memiliki akses ke data Anda sendiri',
          error: 'Forbidden',
        });
      }

      const user = await this.userService.findOne(id);
      if (!user) {
        throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
      }
      return user;
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

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    try {
      if (req.user.role !== UserRole.ADMIN && req.user.id !== id) {
        throw new ForbiddenException({
          statusCode: 403,
          message: 'Anda hanya dapat mengupdate data Anda sendiri',
          error: 'Forbidden',
        });
      }

      const result = await this.userService.update(id, updateUserDto);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Gagal update user: ' + error.message,
          error: 'Bad Request',
        });
      }
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

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    try {
      const result = await this.userService.remove(id);
      if (!result) {
        throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
      }
      return {
        statusCode: 200,
        message: `User dengan ID ${id} berhasil dihapus`,
      };
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
}
