import express from 'express';
import { promises as fs } from 'fs';

import { imagesDir, title } from '../config.js';
import { route } from './utils.js';

const router = express.Router();

router.get(
  '/',
  route(async (req, res, next) => {
    const images = (await fs.readdir(imagesDir)).filter(file =>
      /\.png$/u.exec(file)
    );

    res.render('index', { images });
  })
);

export default router;
