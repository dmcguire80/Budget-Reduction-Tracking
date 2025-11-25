import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Paths to skip logging
const skipPaths = ['/api/health', '/health'];

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip logging for health check endpoints
  if (skipPaths.includes(req.path)) {
    return next();
  }

  const startTime = Date.now();

  // Log request
  logger.info(`Incoming ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(logLevel, `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};
