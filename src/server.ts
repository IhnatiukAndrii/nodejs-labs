import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/database';
import mongoose from 'mongoose';
import { seedDatabase } from './config/seed';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();
        await seedDatabase();

        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        const shutdown = async () => {
            console.log('Shutting down server gracefully...');
            server.close(async () => {
                console.log('HTTP server closed.');
                await mongoose.connection.close();
                console.log('MongoDB connection closed.');
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
