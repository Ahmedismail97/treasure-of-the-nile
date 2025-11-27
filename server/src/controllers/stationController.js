const { Station } = require('../models');

/**
 * Get all stations (public info only)
 */
exports.getAllStations = async (req, res, next) => {
  try {
    const stations = await Station.findAll({
      where: { isActive: true },
      attributes: ['id', 'stationNumber', 'title', 'description', 'location', 'challengeType', 'points'],
      order: [['stationNumber', 'ASC']]
    });

    res.json({ stations });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single station (public info only)
 */
exports.getStation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const station = await Station.findByPk(id, {
      attributes: ['id', 'stationNumber', 'title', 'description', 'location', 'challengeType', 'points']
    });

    if (!station || !station.isActive) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json({ station });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
