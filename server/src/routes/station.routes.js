const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');

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

module.exports = router;
