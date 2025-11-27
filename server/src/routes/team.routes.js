const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { validateTeamLogin, validateTeamRegistration } = require('../middleware/validation');

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

module.exports = router;
