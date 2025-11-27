import express, { Router } from 'express';
import * as progressController from '../controllers/progressController';
import upload from '../middleware/upload';
import { validateChallengeSubmission, validateHintRequest } from '../middleware/validation';

const router: Router = express.Router();

/**
 * GET /api/v1/progress/station/:stationId
 * Get station details if team has access
 */
router.get('/station/:stationId', progressController.getStation);

/**
 * POST /api/v1/progress/station/:stationId/riddle
 * Submit riddle answer
 */
router.post(
  '/station/:stationId/riddle',
  validateChallengeSubmission,
  progressController.submitRiddle
);

/**
 * POST /api/v1/progress/station/:stationId/hint
 * Request hint for riddle
 */
router.post(
  '/station/:stationId/hint',
  validateHintRequest,
  progressController.requestHint
);

/**
 * POST /api/v1/progress/station/:stationId/qr
 * Scan QR code at station
 */
router.post(
  '/station/:stationId/qr',
  validateChallengeSubmission,
  progressController.scanQR
);

/**
 * POST /api/v1/progress/station/:stationId/photo
 * Upload photo for challenge
 */
router.post(
  '/station/:stationId/photo',
  upload.single('photo'),
  progressController.submitPhoto
);

/**
 * POST /api/v1/progress/station/:stationId/physical
 * Submit physical task completion
 */
router.post(
  '/station/:stationId/physical',
  validateChallengeSubmission,
  progressController.submitPhysicalTask
);

/**
 * POST /api/v1/progress/station/:stationId/checkin
 * Check in at station
 */
router.post(
  '/station/:stationId/checkin',
  validateChallengeSubmission,
  progressController.checkIn
);

export default router;

