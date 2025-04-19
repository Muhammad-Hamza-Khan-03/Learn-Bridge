import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn =  await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MONGODB COnnected ${conn.connection.host}:${conn.connection.port}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};