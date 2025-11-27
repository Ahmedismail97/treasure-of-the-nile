import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Team, Admin } from '../models';

interface JWTPayload {
  adminId: number;
  role: string;
}

/**
 * Verify team code (simple auth for teams)
 */
export const verifyTeamCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teamCode = req.body.teamCode || req.query.teamCode || req.headers['x-team-code'] as string;

    if (!teamCode) {
      res.status(401).json({ error: 'Team code required' });
      return;
    }

    const team = await Team.findOne({ where: { teamCode, isActive: true } });

    if (!team) {
      res.status(401).json({ error: 'Invalid team code' });
      return;
    }

    req.team = team;
    next();
  } catch (error) {
    console.error('Team verification error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Verify admin JWT token
 */
export const verifyAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Admin token required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JWTPayload;
    const admin = await Admin.findByPk(decoded.adminId);

    if (!admin) {
      res.status(401).json({ error: 'Invalid admin token' });
      return;
    }

    req.admin = admin;
    next();
  } catch (error) {
    const err = error as Error;
    if (err.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    console.error('Admin verification error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Generate JWT token for admin
 */
export const generateAdminToken = (adminId: number, role: string): string => {
  return jwt.sign(
    { adminId, role },
    process.env.JWT_SECRET || '',
    { expiresIn: '24h' }
  );
};

