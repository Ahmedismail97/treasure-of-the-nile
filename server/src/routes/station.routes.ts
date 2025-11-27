import express, { Router } from 'express';
import * as stationController from '../controllers/stationController';

const router: Router = express.Router();

/**
 * GET /api/v1/stations
 * Get all active stations (public info)
 */
router.get('/', stationController.getAllStations);

/**
 * GET /api/v1/stations/:id
 * Get single station (public info)
 */
router.get('/:id', stationController.getStation);

export default router;

