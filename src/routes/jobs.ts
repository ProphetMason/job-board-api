import { Router } from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getAnalytics,
} from '../controllers/jobController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getJobs);
router.get('/analytics', protect, authorize('recruiter'), getAnalytics);
router.get('/:id', getJobById);
router.post('/', protect, authorize('recruiter'), createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

export default router;