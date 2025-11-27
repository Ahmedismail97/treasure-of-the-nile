import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult, ValidationChain } from 'express-validator';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
    return;
  }
  next();
};

/**
 * Validation rules for team registration
 */
export const validateTeamRegistration: Array<ValidationChain | typeof handleValidationErrors> = [
  body('teamName')
    .trim()
    .notEmpty().withMessage('Team name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Team name must be 3-100 characters'),
  handleValidationErrors
];

/**
 * Validation rules for team login
 */
export const validateTeamLogin: Array<ValidationChain | typeof handleValidationErrors> = [
  body('teamCode')
    .trim()
    .notEmpty().withMessage('Team code is required'),
  handleValidationErrors
];

/**
 * Validation rules for admin login
 */
export const validateAdminLogin: Array<ValidationChain | typeof handleValidationErrors> = [
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
export const validateStation: Array<ValidationChain | typeof handleValidationErrors> = [
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
export const validateChallengeSubmission: Array<ValidationChain | typeof handleValidationErrors> = [
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
export const validateHintRequest: Array<ValidationChain | typeof handleValidationErrors> = [
  body('teamCode')
    .trim()
    .notEmpty().withMessage('Team code is required'),
  param('stationId')
    .isInt().withMessage('Invalid station ID'),
  handleValidationErrors
];

