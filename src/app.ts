import express from 'express';
import cors from 'cors';
import entityRoutes from './routes/entity';
import { loggerMiddleware, errorHandler } from './middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

app.use('/entities', entityRoutes);

app.use(errorHandler);

export default app;
