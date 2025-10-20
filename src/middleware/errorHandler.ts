import { CustomError } from '../types/error.js';

/**
 * BadRequestError - Used for validation or invalid input errors (400)
 */
export class BadRequestError extends Error implements CustomError {
  status = 400;
  constructor(message: string, public data?: Record<string, any>) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * NotFoundError - Used when a requested resource is not found (404)
 */
export class NotFoundError extends Error implements CustomError {
  status = 404;
  constructor(message: string, public data?: Record<string, any>) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * UnauthorizedError - Used for authentication failures (401)
 */
export class UnauthorizedError extends Error implements CustomError {
  status = 401;
  constructor(message = "Unauthorized", public data?: Record<string, any>) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * ForbiddenError - Used when a user doesn't have permission (403)
 */
export class ForbiddenError extends Error implements CustomError {
  status = 403;
  constructor(message: string, public data?: Record<string, any>) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * ConflictError - Used when there's a resource conflict (409)
 */
export class ConflictError extends Error implements CustomError {
  status = 409;
  constructor(message: string, public data?: Record<string, any>) {
    super(message);
    this.name = 'ConflictError';
  }
}

/**
 * InternalServerError - Used for unexpected server errors (500)
 */
export class InternalServerError extends Error implements CustomError {
  status = 500;
  constructor(message: string = 'Internal server error', public data?: Record<string, any>) {
    super(message);
    this.name = 'InternalServerError';
  }
}
