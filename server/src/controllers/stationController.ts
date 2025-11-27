import { Request, Response, NextFunction } from 'express';
import { Station } from '../models';

/**
 * Get all stations (public info only)
 */
export const getAllStations = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
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
export const getStation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const station = await Station.findByPk(id, {
      attributes: ['id', 'stationNumber', 'title', 'description', 'location', 'challengeType', 'points']
    });

    if (!station || !station.isActive) {
      res.status(404).json({ error: 'Station not found' });
      return;
    }

    res.json({ station });
  } catch (error) {
    next(error);
  }
};

