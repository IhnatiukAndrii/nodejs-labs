import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof ZodError) {
        res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: err.issues
        });
        return;
    }

    if (err.name === 'CastError') {
        res.status(400).json({
            status: 'error',
            message: 'Invalid ID format',
            details: err.message
        });
        return;
    }

    if (err.name === 'ValidationError') {
        res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: Object.values(err.errors || {}).map((e: any) => ({
                path: e.path,
                message: e.message
            }))
        });
        return;
    }

    if (err.code === 11000 || err.code === 11001) {
        res.status(400).json({
            status: 'error',
            message: 'Duplicate key error',
            keyValue: err.keyValue
        });
        return;
    }

    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
};

