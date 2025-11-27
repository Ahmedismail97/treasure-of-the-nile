import express, { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { verifyAdmin } from '../middleware/auth';
import { validateAdminLogin, validateStation } from '../middleware/validation';

const router: Router = express.Router();

/**
 * POST /api/v1/admin/login
 * Admin authentication
 */
router.post('/login', validateAdminLogin, adminController.login);

// All routes below require admin authentication
router.use(verifyAdmin);

/**
 * Team Management
 */
router.get('/teams', adminController.getTeams);
router.post('/teams', adminController.createTeam);
router.put('/teams/:id', adminController.updateTeam);
router.delete('/teams/:id', adminController.deleteTeam);

/**
 * Station Management
 */
router.get('/stations', adminController.getStations);
router.post('/stations', validateStation, adminController.createStation);
router.put('/stations/:id', validateStation, adminController.updateStation);
router.delete('/stations/:id', adminController.deleteStation);

/**
 * Progress Monitoring
 */
router.get('/progress/all', adminController.getAllProgress);
router.get('/progress/pending', adminController.getPendingVerifications);

/**
 * Verification & Manual Override
 */
router.post('/progress/verify', adminController.verifySubmission);
router.post('/progress/manual-complete', adminController.manualComplete);

/**
 * QR Code Generation
 */
router.post('/qr/generate/:stationId', adminController.generateQR);
router.post('/qr/generate-all', adminController.generateAllQRs);

/**
 * Event Settings
 */
router.get('/event-settings', adminController.getEventSettings);
router.put('/event-settings', adminController.updateEventSettings);
router.post('/event/end', adminController.endEvent);

/**
 * Statistics
 */
router.get('/statistics', adminController.getStatistics);

export default router;

