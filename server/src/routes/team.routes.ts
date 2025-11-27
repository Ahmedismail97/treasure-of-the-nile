import express, { Router } from 'express';
import * as teamController from '../controllers/teamController';
import { validateTeamLogin, validateTeamRegistration } from '../middleware/validation';

const router: Router = express.Router();

/**
 * POST /api/v1/team/login
 * Team login with team code
 */
router.post('/login', validateTeamLogin, teamController.login);

/**
 * POST /api/v1/team/register
 * Self-registration for teams
 */
router.post('/register', validateTeamRegistration, teamController.register);

/**
 * GET /api/v1/team/progress/:teamCode
 * Get team's progress
 */
router.get('/progress/:teamCode', teamController.getProgress);

export default router;

