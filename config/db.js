import mongoose from "mongoose";

let cached = global.mongoose;
// Check if the mongoose instance is already cached
// This prevents multiple connections to the database in development mode
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            connectTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000,  // 45 seconds
            maxPoolSize: 10,         // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Give up initial connection after 5 seconds
            heartbeatFrequencyMS: 30000,    // Ping MongoDB every 30 seconds
            retryWrites: true,
            retryReads: true,
        };

        // Make connection string more robust by checking for trailing slash
        let connectionString = process.env.MONGODB_URL;
        if (connectionString.endsWith('/')) {
            connectionString = connectionString + 'ecommerce';
        } else {
            connectionString = connectionString + '/ecommerce';
        }

        console.log('Connecting to MongoDB...');
        
        cached.promise = mongoose
            .connect(connectionString, opts)
            .then((mongoose) => {
                console.log('Connected to MongoDB successfully');
                return mongoose;
            })
            .catch((error) => {
                console.error('MongoDB connection error:', error);
                cached.promise = null; // Reset promise so next request can try again
                throw error;
            });
    }
    
    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null; // Reset promise so next request can try again
        throw error;
    }
}

export default connectDB;