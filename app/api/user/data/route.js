import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ 
                success: false, 
                message: "Authentication failed. No user ID found." 
            });
        }
        
        // Try connecting to DB with retry mechanism
        let connected = false;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (!connected && retryCount < maxRetries) {
            try {
                await connectDB();
                connected = true;
            } catch (dbError) {
                retryCount++;
                if (retryCount >= maxRetries) {
                    console.error("Database connection failed after retries:", dbError);
                    throw dbError;
                }
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" });
        }
        
        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("Error in user data API route:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message,
            // Provide more details about the error type
            errorType: error.name,
            // Include hint for MongoDB connection issues
            hint: error.message.includes("MongoDB") ? 
                "There might be an issue with your MongoDB connection. Check your connection string and network settings." : 
                undefined
        });
    }
}