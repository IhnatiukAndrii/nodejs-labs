import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.NODE_ENV === 'test' && !req.headers['x-enable-auth']) {
        req.userId = '507f1f77bcf86cd799439011';
        next();
        return;
    }

    const token = req.cookies?.access_token;
    if (!token) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
    }

    try {
        const payload: any = jwt.verify(token, JWT_SECRET);
        req.userId = payload.sub;
        next();
    } catch (error) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
};
