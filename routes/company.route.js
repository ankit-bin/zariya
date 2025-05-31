import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js'; 
import { registerCompany, updateCompany, getLocationSuggestions } from '../controllers/company.controller.js';

const router = express.Router();

router.route("/register").post(isAuthenticated, registerCompany);
router.route("/update").put(isAuthenticated, updateCompany);
router.route("/location-suggestions").get(getLocationSuggestions);

export default router;