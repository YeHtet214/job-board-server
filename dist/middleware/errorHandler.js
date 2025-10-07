"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.BadRequestError = void 0;
/**
 * BadRequestError - Used for validation or invalid input errors (400)
 */
class BadRequestError extends Error {
    constructor(message, data) {
        super(message);
        this.data = data;
        this.status = 400;
        this.name = 'ValidationError';
    }
}
exports.BadRequestError = BadRequestError;
/**
 * NotFoundError - Used when a requested resource is not found (404)
 */
class NotFoundError extends Error {
    constructor(message, data) {
        super(message);
        this.data = data;
        this.status = 404;
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
/**
 * UnauthorizedError - Used for authentication failures (401)
 */
class UnauthorizedError extends Error {
    constructor(message, data) {
        super(message);
        this.data = data;
        this.status = 401;
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * ForbiddenError - Used when a user doesn't have permission (403)
 */
class ForbiddenError extends Error {
    constructor(message, data) {
        super(message);
        this.data = data;
        this.status = 403;
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * ConflictError - Used when there's a resource conflict (409)
 */
class ConflictError extends Error {
    constructor(message, data) {
        super(message);
        this.data = data;
        this.status = 409;
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
/**
 * InternalServerError - Used for unexpected server errors (500)
 */
class InternalServerError extends Error {
    constructor(message = 'Internal server error', data) {
        super(message);
        this.data = data;
        this.status = 500;
        this.name = 'InternalServerError';
    }
}
exports.InternalServerError = InternalServerError;
