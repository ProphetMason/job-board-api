import { Router } from 'express';
import {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} from '../controllers/applicationController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.post('/:jobId', protect, authorize('candidate'), applyToJob);
router.get('/mine', protect, authorize('candidate'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter'), getJobApplications);
router.patch('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

export default router;