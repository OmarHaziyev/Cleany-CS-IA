import express from 'express';
import {
  createCleaner,
  getAllCleanersForDashboard,
  getCleanerByID,
  updateCleaner,
  deleteCleaner,
  filterCleaners,
  loginCleaner
} from '../controllers/cleanerController.js';
import { protect } from './middleware/auth.js';

const router = express.Router();

router.post('/cleaners', createCleaner);
router.get('/cleaners', getAllCleanersForDashboard);
router.get('/cleaners/filter', filterCleaners);
router.get('/cleaners/:id', getCleanerByID);
router.put('/cleaners/:id', updateCleaner);
router.delete('/cleaners/:id', deleteCleaner);
router.post('/cleaners/login', loginCleaner);

export default router;
