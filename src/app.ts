import express from 'express';
import cors from 'cors';
import entityRoutes from './routes/entity';
import { loggerMiddleware, errorHandler } from './middleware';
import mongoose from 'mongoose';

const app = express();

export const healthCheck = (readyState: number, res: any) => {
    const dbConnected = readyState === 1;
    if (dbConnected) {
        res.status(200).json({ status: 'UP', db: 'connected' });
    } else {
        res.status(503).json({ status: 'DOWN', db: 'disconnected' });
    }
};

app.get('/health', (req, res) => {
    healthCheck(mongoose.connection.readyState, res);
});

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

app.use('/entities', entityRoutes);

app.use(errorHandler);

export default app;
