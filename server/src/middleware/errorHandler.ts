import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (err: CustomError, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Error:', err);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const validationError = err as any;
    res.status(400).json({
      error: 'Validation error',
      details: validationError.errors.map((e: any) => ({ field: e.path, message: e.message }))
    });
    return;
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const uniqueError = err as any;
    res.status(409).json({
      error: 'Resource already exists',
      details: uniqueError.errors.map((e: any) => ({ field: e.path, message: `${e.path} must be unique` }))
    });
    return;
  }

  // Sequelize foreign key errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    res.status(400).json({
      error: 'Invalid reference',
      message: 'Referenced resource does not exist'
    });
    return;
  }

  // JWT errors (should be caught by auth middleware, but just in case)
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Invalid token'
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Token expired'
    });
    return;
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      error: 'File too large',
      message: 'Maximum file size is 5MB'
    });
    return;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    res.status(400).json({
      error: 'Invalid file upload',
      message: 'Unexpected field or too many files'
    });
    return;
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 handler
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Resource not found',
    path: req.originalUrl
  });
};

