import multer from 'multer';

// Phase 1 Upload Middleware Stub (Multer disk storage and MIME validation implemented in Phase 3)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
});
