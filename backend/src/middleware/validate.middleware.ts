import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Generic validation middleware using Zod
 * Validates request body against provided schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      schema.parse(req.body);
      next();
    } catch (error) {
      // Pass validation error to error handler
      next(error);
    }
  };
};
