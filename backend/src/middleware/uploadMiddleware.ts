import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ENV } from '../config/environment.js';
import { APP_CONSTANTS } from '../config/constants.js';

// Ensure base upload directory exists
if (!fs.existsSync(ENV.UPLOAD_DIR)) {
  fs.mkdirSync(ENV.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const userId = req.user?.userId || 'anonymous';
    const userDir = path.join(ENV.UPLOAD_DIR, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (APP_CONSTANTS.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: PDF, PNG, JPG, TXT.`));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: APP_CONSTANTS.MAX_FILE_SIZE_BYTES,
  },
  fileFilter,
});
