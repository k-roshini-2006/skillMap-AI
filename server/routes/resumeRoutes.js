import express from 'express';
import multer from 'multer';
import { 
  analyzeResume, 
  getLatestResume,
  getHistory, 
  getResumeById, 
  deleteResume 
} from '../controllers/resumeController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze', upload.single('resume'), analyzeResume);
router.get('/latest', getLatestResume);
router.get('/resumes', getHistory);
router.get('/resumes/:id', getResumeById);
router.delete('/resumes/:id', deleteResume);

export default router;