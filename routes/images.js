import express from 'express';
import multer from 'multer';
import { resolve as resolvePath } from 'path';

import { createLogger, imagesDir } from '../config.js';
import { route } from './utils.js';

const router = express.Router();
const logger = createLogger('images');

/**
 * (ㆆ _ ㆆ)
 */
function determineUploadedFileLocation(req, uploadedFile) {
  const originalName = req.body.name ?? uploadedFile.originalname;
  const filename = originalName.replace(/^.*\//, '');
  const directory =
    imagesDir + originalName.slice(0, originalName.lastIndexOf(filename));

  return { directory, filename };
}

const storage = multer.diskStorage({
  destination: function (req, uploadedFile, cb) {
    const { directory } = determineUploadedFileLocation(req, uploadedFile);
    logger.debug(`Saving image to directory ${directory}`);

    cb(null, directory);
  },
  filename: function (req, uploadedFile, cb) {
    const { filename } = determineUploadedFileLocation(req, uploadedFile);
    logger.debug(`Saving image as ${filename}`);

    cb(null, filename);
  }
});

const upload = multer({ dest: imagesDir, storage });

// POST /images - save uploaded images
router.post('/', upload.single('image'), (req, res) => {
  res.redirect('/');
});

// GET /images/:name - display an uploaded image
router.get(
  '/:image',
  route(async (req, res) => {
    /*
     * (ㆆ _ ㆆ)
     */
    const file = resolvePath(`${imagesDir}/${req.params.image}`);
    logger.debug(`Reading file ${file}`);
    res.sendFile(file);
  })
);

export default router;
