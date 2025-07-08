import mongoose from "mongoose";

let cached = global.mongoose;
// Check if the mongoose instance is already cached
// This prevents multiple connections to the database in development mode
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    try {
        if (cached.conn) {
            console.log(`Using cached connection to database: ${mongoose.connection.db ? mongoose.connection.db.databaseName : 'unknown'}`);
            // Force switch to ecommerce database even with cached connection
            if (mongoose.connection.db && mongoose.connection.db.databaseName !== 'ecommerce') {
                console.log(`Switching from ${mongoose.connection.db.databaseName} to ecommerce database`);
                // Force the use of ecommerce database
                mongoose.connection.useDb('ecommerce');
            }
            return cached.conn;
        }

        if (!cached.promise) {
            const opts = {
                bufferCommands: false,
                dbName: 'ecommerce', // Explicitly set database name
                autoIndex: true
            };

            const mongoUrl = process.env.MONGODB_URL;
            if (!mongoUrl) {
                throw new Error('MONGODB_URL environment variable is not set');
            }

            // Force the database name to be ecommerce by constructing the proper URL
            let connectionUrl = mongoUrl;
            // If URL already contains a database name, remove it and replace with ecommerce
            if (connectionUrl.includes('mongodb+srv://') || connectionUrl.includes('mongodb://')) {
                // Remove any database name if it exists
                const urlParts = connectionUrl.split('/');
                // Keep everything up to the third slash (mongodb://host/)
                const baseUrl = urlParts.slice(0, 3).join('/');
                // Create new URL with explicit database name
                connectionUrl = `${baseUrl}/ecommerce`;
            }
            
            console.log(`Connecting to MongoDB with database: ecommerce`);
            
            cached.promise = mongoose
              .connect(connectionUrl, opts)
              .then((mongoose) => {
                // Verify the database name after connection
                console.log(`MongoDB connected to database: ${mongoose.connection.db.databaseName}`);
                
                // Explicitly use the ecommerce database regardless of connection
                if (mongoose.connection.db.databaseName !== 'ecommerce') {
                    console.log(`Switching from ${mongoose.connection.db.databaseName} to ecommerce database`);
                    mongoose.connection.useDb('ecommerce');
                }
                
                return mongoose;
              });
        }
        
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}
export default connectDB;