import { Request, Response, NextFunction } from 'express';
import { sendError } from '../config/response';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Global Error]', err.stack);
  sendError(res, err.message || 'Internal server error', 500);
};

export const notFound = (_req: Request, res: Response): void => {
  sendError(res, `Route not found: ${_req.originalUrl}`, 404);
};
