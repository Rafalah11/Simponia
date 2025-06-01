import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

export const multerConfig = (folder: string) => ({
  storage: diskStorage({
    destination: `./Uploads/${folder}`, // Folder dinamis: 'portofolio', 'user', dll.
    filename: (req: Request, file: Express.Multer.File, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(
        new BadRequestException(
          'Only image files (jpg, jpeg, png, gif) are allowed!',
        ),
        false,
      );
    }
    callback(null, true);
  },
});
