import mongoose from "mongoose";

let cached = global.mongoose;
// Check if the mongoose instance is already cached
// This prevents multiple connections to the database in development mode
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

// Helper to clear cached models if needed
function clearModelCache() {
    // Delete any potentially cached models
    try {
        if (mongoose.models && mongoose.models.order) {
            delete mongoose.models.order;
            console.log("Cleared cached Order model");
        }
    } catch (err) {
        console.error("Error clearing model cache:", err);
    }
}

// Helper to migrate existing orders with ammount to amount
async function migrateOrderAmounts() {
    try {
        // Only run if we have a connection
        if (!mongoose.connection.db) return;
        
        console.log("Running order amount field migration...");
        
        // Find orders with ammount field but missing amount field
        const ordersToFix = await mongoose.connection.db.collection('orders').find({
            ammount: { $exists: true },
            amount: { $exists: false }
        }).toArray();
        
        if (ordersToFix.length > 0) {
            console.log(`Found ${ordersToFix.length} orders that need migration from 'ammount' to 'amount'`);
            
            for (const order of ordersToFix) {
                await mongoose.connection.db.collection('orders').updateOne(
                    { _id: order._id },
                    { $set: { amount: order.ammount }, $unset: { ammount: "" } }
                );
            }
            
            console.log(`Successfully migrated ${ordersToFix.length} orders from 'ammount' to 'amount'`);
        } else {
            console.log("No orders found that need migration");
        }
    } catch (err) {
        console.error("Error during order amount migration:", err);
    }
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

        // Clear any cached models before creating a new connection
        clearModelCache();

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

            // Log the MongoDB connection URL (without sensitive info)
            console.log(`MongoDB URL: ${mongoUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
            
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
                console.log(`Modified connection URL to force ecommerce database. Base URL: ${baseUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}/ecommerce`);
            }
            
            console.log(`Connecting to MongoDB with database: ecommerce`);
            
            cached.promise = mongoose
              .connect(connectionUrl, opts)
              .then(async (mongoose) => {
                // Verify the database name after connection
                console.log(`MongoDB connected to database: ${mongoose.connection.db.databaseName}`);
                
                // List available collections to debug
                const collections = await mongoose.connection.db.listCollections().toArray();
                console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
                
                // Explicitly use the ecommerce database regardless of connection
                if (mongoose.connection.db.databaseName !== 'ecommerce') {
                    console.log(`Switching from ${mongoose.connection.db.databaseName} to ecommerce database`);
                    mongoose.connection.useDb('ecommerce');
                }
                
                // Run migration to fix order fields after connection is established
                await migrateOrderAmounts();
                
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