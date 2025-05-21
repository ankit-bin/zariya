import express from 'express';
import isAuthenticated  from '../middlewares/isAuthenticated.js';
import {
    createApplication,
    getJobApplications,
    getUserApplications,
    updateApplicationStatus,
    getHelperJobApplicationCount
} from '../controllers/application.controller.js';

const router = express.Router();

// Create a new application (for helpers and self-workers)
router.post('/create', isAuthenticated, createApplication);

// Get all applications for a specific job (for recruiters)
router.get('/job/:jobId', isAuthenticated, getJobApplications);

// Get all applications submitted by a user (for helpers and self-workers)
router.get('/user', isAuthenticated, getUserApplications);

// Update application status (for recruiters)
router.put('/status/:applicationId', isAuthenticated, updateApplicationStatus);

// Get helper's applications and count for a specific job
router.get('/job/:jobId/helper-applications', isAuthenticated, getHelperJobApplicationCount);

export default router; 