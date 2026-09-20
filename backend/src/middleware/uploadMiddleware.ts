import multer from 'multer';
import { APP_CONSTANTS } from '../config/constants.js';

const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const normalizedMime = file.mimetype.toLowerCase();

  if (APP_CONSTANTS.ALLOWED_FILE_TYPES.includes(normalizedMime)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed formats: PDF, PNG, JPG, JPEG, TXT.`));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: APP_CONSTANTS.MAX_FILE_SIZE_BYTES,
    files: 10,
  },
  fileFilter,
});
