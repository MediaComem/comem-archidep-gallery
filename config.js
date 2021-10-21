import dotenv from 'dotenv';
import log4js from 'log4js';
import { dirname, join as joinPath } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

export const root = dirname(fileURLToPath(import.meta.url));
export const imagesDir = joinPath(root, 'images');

export const host = process.env.GALLERY_LISTEN_HOST ?? '127.0.0.1';
export const port = parseInt(process.env.GALLERY_LISTEN_PORT ?? '3000', 10);

export function createLogger(category) {
  const logger = log4js.getLogger(category);
  logger.level = 'DEBUG';
  return logger;
}
