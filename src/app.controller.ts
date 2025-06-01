import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import * as fs from 'fs';
import { join } from 'path';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('uploads/:folder/:filename')
  async serveImage(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const validFolders = [
      'user',
      'acara',
      'admin',
      'admin-community',
      'portofolio',
    ];
    if (!validFolders.includes(folder)) {
      return res.status(400).json({
        message: 'Invalid folder',
        folder,
      });
    }

    const filePath = join(process.cwd(), 'Uploads', folder, filename);

    console.log('=== Debug Image Request ===');
    console.log('Requested folder:', folder);
    console.log('Requested filename:', filename);
    console.log('Full file path:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    console.log('Current working directory:', process.cwd());

    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    return res.status(404).json({
      message: 'File not found',
      path: filePath,
      exists: fs.existsSync(filePath),
      directory: fs.existsSync(join(process.cwd(), 'Uploads', folder))
        ? fs.readdirSync(join(process.cwd(), 'Uploads', folder))
        : 'Directory not found',
    });
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
