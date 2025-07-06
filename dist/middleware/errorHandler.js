/**
 * BadRequestError - Used for validation or invalid input errors (400)
 */
export class BadRequestError extends Error {
    data;
    status = 400;
    constructor(message, data) {
        super(message);
        this.data = data;
        this.name = 'ValidationError';
    }
}
/**
 * NotFoundError - Used when a requested resource is not found (404)
 */
export class NotFoundError extends Error {
    data;
    status = 404;
    constructor(message, data) {
        super(message);
        this.data = data;
        this.name = 'NotFoundError';
    }
}
/**
 * UnauthorizedError - Used for authentication failures (401)
 */
export class UnauthorizedError extends Error {
    data;
    status = 401;
    constructor(message, data) {
        super(message);
        this.data = data;
        this.name = 'UnauthorizedError';
    }
}
/**
 * ForbiddenError - Used when a user doesn't have permission (403)
 */
export class ForbiddenError extends Error {
    data;
    status = 403;
    constructor(message, data) {
        super(message);
        this.data = data;
        this.name = 'ForbiddenError';
    }
}
/**
 * ConflictError - Used when there's a resource conflict (409)
 */
export class ConflictError extends Error {
    data;
    status = 409;
    constructor(message, data) {
        super(message);
        this.data = data;
        this.name = 'ConflictError';
    }
}
/**
 * InternalServerError - Used for unexpected server errors (500)
 */
export class InternalServerError extends Error {
    data;
    status = 500;
    constructor(message = 'Internal server error', data) {
        super(message);
        this.data = data;
        this.name = 'InternalServerError';
    }
}
