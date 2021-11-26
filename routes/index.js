import express from 'express';
import { promises as fs } from 'fs';

import { imagesDir, title } from '../config.js';
import { route } from './utils.js';

const router = express.Router();

/**
 * GET / - Serve the home page
 */
router.get(
  '/',
  route(async (req, res, next) => {
    // List files from the images directory.
    const images = (await fs.readdir(imagesDir)).filter(file =>
      /\.(?:gif|je?pg|png)$/u.exec(file)
    );

    res.render('index', { images });
  })
);

export default router;
