import { constants } from 'fs';
import { access, copyFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { UPLOAD_PATH_TEMP } from './config';
import BadRequestError from '../errors/bad-request-error';

export const imagesDir = path.resolve(__dirname, '../../public/images');
export const tempDir = path.resolve(__dirname, '../../', UPLOAD_PATH_TEMP || 'temp');

const imageName = (fileName: string): string | null => {
  const match = /^\/images\/([a-zA-Z0-9_-]+\.(?:png|jpe?g|gif|webp|svg))$/.exec(fileName);
  return match?.[1] || null;
};

export const ensureImageExists = async (fileName: string): Promise<void> => {
  const name = imageName(fileName);
  if (!name) throw new BadRequestError('Некорректный путь к изображению');

  try {
    await access(path.join(tempDir, name), constants.R_OK);
  } catch {
    try {
      await access(path.join(imagesDir, name), constants.R_OK);
    } catch {
      throw new BadRequestError('Файл изображения не найден');
    }
  }
};

export const saveProductImage = async (fileName: string): Promise<void> => {
  const name = imageName(fileName);
  if (!name) throw new BadRequestError('Некорректный путь к изображению');

  const source = path.join(tempDir, name);
  try {
    await access(source, constants.R_OK);
  } catch {
    return;
  }

  await mkdir(imagesDir, { recursive: true });
  await copyFile(source, path.join(imagesDir, name));
  await unlink(source);
};

export const removeProductImage = async (fileName: string): Promise<void> => {
  const name = imageName(fileName);
  if (!name) return;

  try {
    await unlink(path.join(imagesDir, name));
  } catch (error) {
    if ((error as { code?: string }).code !== 'ENOENT') throw error;
  }
};
