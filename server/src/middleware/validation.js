const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * Validation rules for team registration
 */
const validateTeamRegistration = [
  body('teamName')
    .trim()
    .notEmpty().withMessage('Team name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Team name must be 3-100 characters'),
  handleValidationErrors
];

/**
 * Validation rules for team login
 */
const validateTeamLogin = [
  body('teamCode')
    .trim()
    .notEmpty().withMessage('Team code is required'),
  handleValidationErrors
];

/**
 * Validation rules for admin login
 */
const validateAdminLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Validation rules for station creation/update
 */
const validateStation = [
  body('stationNumber')
    .isInt({ min: 1, max: 10 }).withMessage('Station number must be between 1-10'),
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required'),
  body('challengeType')
    .isIn(['riddle', 'photo', 'physical', 'checkin', 'qr'])
    .withMessage('Invalid challenge type'),
  body('points')
    .optional()
    .isInt({ min: 0 }).withMessage('Points must be a positive number'),
  handleValidationErrors
];

/**
 * Validation rules for challenge submission
 */
const validateChallengeSubmission = [
  body('teamCode')
    .trim()
    .notEmpty().withMessage('Team code is required'),
  param('stationId')
    .isInt().withMessage('Invalid station ID'),
  handleValidationErrors
];

/**
 * Validation rules for hint request
 */
const validateHintRequest = [
  body('teamCode')
    .trim()
    .notEmpty().withMessage('Team code is required'),
  param('stationId')
    .isInt().withMessage('Invalid station ID'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateTeamRegistration,
  validateTeamLogin,
  validateAdminLogin,
  validateStation,
  validateChallengeSubmission,
  validateHintRequest
};
