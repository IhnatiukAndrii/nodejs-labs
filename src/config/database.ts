import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI is not defined in the environment variables');
    }

    mongoose.connection.on('error', (err) => {
        console.error(`Mongoose connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose connection disconnected');
    });

    await mongoose.connect(uri);
    console.log('Successfully connected to MongoDB');
};
