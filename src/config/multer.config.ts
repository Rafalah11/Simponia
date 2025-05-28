import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';

export const multerConfig = (folder: string) => ({
  storage: diskStorage({
    destination: `./Uploads/${folder}`, // Folder dinamis: 'portofolio', 'user', dll.
    filename: (req: Request, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req: Request, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  },
});
