import { Router, CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { validate } from '../middleware/validation';
import { registerSchema } from '../schemas/auth.schema';
import { User } from '../models/user.model';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '30d';
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

const COOKIE_BASE: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
};

function issueTokens(userId: string) {
    const accessToken = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
    const refreshToken = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
    return { accessToken, refreshToken };
}

function setTokenCookies(res: any, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, { ...COOKIE_BASE });
    res.cookie('refresh_token', refreshToken, {
        ...COOKIE_BASE,
        maxAge: REFRESH_TOKEN_TTL_MS
    });
}

/**
 * POST /auth/register
 */
router.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            res.status(409).json({
                status: 'error',
                message: `Email '${email}' is already registered`
            });
            return;
        }

        const user = new User({ email, passwordHash: password });
        await user.save();

        res.status(201).json({
            status: 'success',
            data: {
                id: user._id,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /auth/login
 * Finds user, verifies password, issues access + refresh tokens as httpOnly cookies.
 * Returns 401 without any details on failure.
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
            return;
        }

        const user = await User.findOne({ email: String(email).toLowerCase() });
        if (!user) {
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
            return;
        }

        const valid = await user.comparePassword(String(password));
        if (!valid) {
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
            return;
        }

        const { accessToken, refreshToken } = issueTokens(String(user._id));
        setTokenCookies(res, accessToken, refreshToken);

        // Response body must NOT contain tokens
        res.status(200).json({
            status: 'success',
            data: { id: user._id, email: user.email }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /auth/refresh
 * Reads refresh_token cookie, verifies it, issues new access + refresh tokens.
 */
router.post('/refresh', async (req, res, next) => {
    try {
        const token = req.cookies?.refresh_token;
        if (!token) {
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
            return;
        }

        let payload: any;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch {
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
            return;
        }

        const { accessToken, refreshToken } = issueTokens(String(payload.sub));
        setTokenCookies(res, accessToken, refreshToken);

        res.status(200).json({ status: 'success' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /auth/logout
 * Clears both cookies.
 */
router.post('/logout', (req, res) => {
    res.clearCookie('access_token', COOKIE_BASE);
    res.clearCookie('refresh_token', COOKIE_BASE);
    res.status(200).json({ status: 'success', message: 'Logged out' });
});

export default router;
