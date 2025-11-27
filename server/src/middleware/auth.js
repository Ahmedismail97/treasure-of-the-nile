const jwt = require('jsonwebtoken');
const { Team, Admin } = require('../models');

/**
 * Verify team code (simple auth for teams)
 */
const verifyTeamCode = async (req, res, next) => {
  try {
    const teamCode = req.body.teamCode || req.query.teamCode || req.headers['x-team-code'];

    if (!teamCode) {
      return res.status(401).json({ error: 'Team code required' });
    }

    const team = await Team.findOne({ where: { teamCode, isActive: true } });

    if (!team) {
      return res.status(401).json({ error: 'Invalid team code' });
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
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Admin token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findByPk(decoded.adminId);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin token' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Admin verification error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Generate JWT token for admin
 */
const generateAdminToken = (adminId, role) => {
  return jwt.sign(
    { adminId, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  verifyTeamCode,
  verifyAdmin,
  generateAdminToken
};
