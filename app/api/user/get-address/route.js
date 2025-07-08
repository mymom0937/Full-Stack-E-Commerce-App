import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db.js";

export async function GET(request) {
    try {
        // Get the clerk auth data from request
        const authData = getAuth(request);
        console.log("Get address - Auth data available:", authData ? "yes" : "no");

        // Get the authorization header for debugging
        const authHeader = request.headers.get('authorization');
        console.log("Get address - Authorization header present:", authHeader ? "yes" : "no");
        
        // Extract userId from auth data
        const userId = authData?.userId;
        console.log("Getting addresses for user ID:", userId);
        
        if (!userId) {
            console.error("Authentication failed - no userId found");
            
            // Check for userId in URL or query parameters as fallback
            const url = new URL(request.url);
            const queryUserId = url.searchParams.get('userId');
            
            if (!queryUserId) {
                return NextResponse.json({
                    success: false,
                    message: "Authentication failed. Please sign in again.",
                }, { status: 401 });
            }
            
            console.log("Using userId from query parameters:", queryUserId);
            await connectDB();
            
            // Fetch the address for the user from query param
            const addresses = await Address.find({ userId: queryUserId });
            console.log(`Found ${addresses.length} addresses for user ${queryUserId}`);
            
            return NextResponse.json({
                success: true,
                address: addresses,
            });
        } else {
            // We have userId from auth, proceed normally
            await connectDB();
            
            // Fetch the address for the user
            const addresses = await Address.find({ userId });
            console.log(`Found ${addresses.length} addresses for user ${userId}`);
            
            return NextResponse.json({
                success: true,
                address: addresses,
            });
        }
    } catch (error) {
        console.error("Error in get-address route:", error);
        return NextResponse.json({
            success: false,
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}