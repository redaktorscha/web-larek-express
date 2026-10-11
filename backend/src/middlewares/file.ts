import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import multer from 'multer';
import BadRequestError from '../errors/bad-request-error';
import { tempDir } from '../helpers/product-image';

const extensions: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

mkdirSync(tempDir, { recursive: true });

const fileMiddleware = multer({
  storage: multer.diskStorage({
    destination: tempDir,
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${extensions[file.mimetype]}`);
    },
  }),
  fileFilter: (_req, file, callback) => {
    if (!extensions[file.mimetype]) {
      callback(new BadRequestError('Можно загрузить только изображение'));
      return;
    }
    callback(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

export default fileMiddleware;
