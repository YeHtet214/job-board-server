const errorHandler = (err, req, res, next) => {
    try {
        let error = { ...err };
        error.message = err.message;
        if (err.name === 'CastError') {
            const message = err.message || 'Invalid data type';
            error = new Error(message);
            error.status = 400;
        }
        if (err.name === 'ValidationError') {
            const message = err.message || 'Validation failed';
            error = new Error(message);
            error.status = 400;
        }
        if (err.name === 'NotFoundError') {
            const message = err.message || 'Resource not found';
            error = new Error(message);
            error.status = 404;
        }
        if (err.name === 'UnauthorizedError') {
            const message = err.message || 'Unauthorized access';
            error = new Error(message);
            error.status = 401;
        }
        if (err.name === 'ForbiddenError') {
            const message = err.message || 'Forbidden access';
            error = new Error(message);
            error.status = 403;
        }
        if (err.name === 'ConflictError') {
            const message = err.message || 'Resource conflict';
            error = new Error(message);
            error.status = 409;
        }
        if (err.name === 'InternalServerError') {
            const message = err.message || 'Internal server error';
            error = new Error(message);
            error.status = 500;
        }
        res.status(err.status || 500).json({
            message: error.message || 'Internal server error',
            data: err.data
        });
    }
    catch (error) {
        next(error);
    }
};
export default errorHandler;
