import { RequestHandler } from 'express';
import { readFile, unlink } from 'fs/promises';
import BadRequestError from '../errors/bad-request-error';

const isImage = (data: Buffer, mimetype: string): boolean => {
  switch (mimetype) {
    case 'image/png':
      return data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    case 'image/jpeg':
      return data.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
    case 'image/gif':
      return ['GIF87a', 'GIF89a'].includes(data.subarray(0, 6).toString());
    case 'image/webp':
      return (
        data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP'
      );
    case 'image/svg+xml':
      return /<svg(?:\s|>)/i.test(data.subarray(0, 1024).toString('utf8'));
    default:
      return false;
  }
};

const uploadFile: RequestHandler = async (req, res, next) => {
  if (!req.file) {
    next(new BadRequestError('Файл не передан'));
    return;
  }

  try {
    const contents = await readFile(req.file.path);
    if (!isImage(contents, req.file.mimetype)) {
      await unlink(req.file.path);
      next(new BadRequestError('Файл не является изображением'));
      return;
    }

    res.json({
      fileName: `/images/${req.file.filename}`,
      originalName: req.file.originalname,
    });
  } catch (error) {
    next(error);
  }
};

export default uploadFile;
