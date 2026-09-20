import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

export const documentRoutes = Router();

documentRoutes.use(authenticateUser);

documentRoutes.get('/', async (_req, res) => {
  res.json({ success: true, data: [] });
});

documentRoutes.post('/upload', upload.array('files', 10), async (req, res) => {
  res.json({ success: true, message: 'Files uploaded successfully', files: req.files });
});

documentRoutes.get('/:id', async (req, res) => {
  res.json({ success: true, id: req.params.id });
});

documentRoutes.delete('/:id', async (req, res) => {
  res.json({ success: true, deletedId: req.params.id });
});
