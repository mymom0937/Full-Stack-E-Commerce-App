import mongoose from "mongoose";

let cached= global.mongoose;
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
        };

        cached.promise = mongoose
          .connect(`${process.env.MONGODB_URI}/ecommerce`, opts)
          .then((mongoose) => {
            return mongoose;
          });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
export default connectDB;