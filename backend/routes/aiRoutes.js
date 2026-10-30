import express from 'express';
import { generateDescription, suggestPriority, getStatus, simulateFailure } from '../controllers/aiController.js';
import { aiRateLimiter } from '../middleware/aiRateLimiter.js';

const router = express.Router();

// GET AI Service Status & Policies
router.get('/status', getStatus);

// POST Generate Description (Protected with Rate Limiter: max 1/min)
router.post('/generate-description', aiRateLimiter, generateDescription);

// POST Suggest Priority
router.post('/suggest-priority', suggestPriority);

// POST Deliberate Failure Simulation (Step 6 of Syllabus)
router.post('/simulate-failure', simulateFailure);

export default router;
