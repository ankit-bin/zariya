import express from 'express';
import { 
    createApplication, 
    getJobApplications, 
    getUserApplications, 
    updateApplicationStatus,
    getHelperJobApplicationCount 
} from '../controllers/application.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create new application (for helpers and self-workers)
router.post('/create', isAuthenticated, createApplication);

// Get all applications for a specific job (for recruiters)
router.get('/job/:jobId', isAuthenticated, getJobApplications);

// Get all applications submitted by a user (for helpers and self-workers)
router.get('/user', isAuthenticated, getUserApplications);

// Update application status (for recruiters)
router.put('/:applicationId/status', isAuthenticated, updateApplicationStatus);

// Get helper's applications and count for a specific job
router.get('/job/:jobId/helper-applications', isAuthenticated, getHelperJobApplicationCount);

export default router; 