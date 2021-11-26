import express from 'express';
import multer from 'multer';
import { resolve as resolvePath } from 'path';

import { createLogger, imagesDir } from '../config.js';
import { route } from './utils.js';

const router = express.Router();
const logger = createLogger('images');

function determineUploadedFileLocation(req, uploadedFile) {
  // Get the filename specified by the client or from the uploaded file.
  const originalName = req.body.name ?? uploadedFile.originalname;
  const filename = originalName.replace(/^.*\//, '');

  // (ㆆ _ ㆆ)
  const directory =
    imagesDir + originalName.slice(0, originalName.lastIndexOf(filename));

  return { directory, filename };
}

// Configure the multer library to store images where we specify.
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

// POST /images - Save uploaded images then redirect to the home page
router.post('/', upload.single('image'), (req, res) => {
  res.redirect('/');
});

// GET /images/:name - Display an uploaded image by name
router.get(
  '/:image',
  route(async (req, res) => {
    // (ㆆ _ ㆆ)
    const file = resolvePath(`${imagesDir}/${req.params.image}`);
    logger.debug(`Reading file ${file}`);
    res.sendFile(file);
  })
);

export default router;
