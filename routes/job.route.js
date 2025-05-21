import express from 'express';
import { postJob, getAllJobs, getRecruiterJobs, updateJob, deleteJob } from '../controllers/job.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

router.post('/post', isAuthenticated, postJob);

router.get('/all', getAllJobs);

router.get('/recruiter', isAuthenticated, getRecruiterJobs);

// Route to update a job
router.put('/update/:jobId', isAuthenticated, updateJob);

// Route to delete a job
router.delete('/delete/:jobId', isAuthenticated, deleteJob);

export default router;
