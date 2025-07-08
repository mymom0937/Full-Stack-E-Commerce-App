import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request){
    try {
        console.log("Fetching user data...");
        const auth = getAuth(request);
        console.log("Auth data:", auth);
        const {userId} = auth;
        
        if (!userId) {
            return NextResponse.json({success:false, message:"Not authenticated"});
        }
        
        console.log("User ID from Clerk:", userId);
        
        // Ensure DB connection is established before using the model
        await connectDB();
        console.log("Connected to MongoDB");
        
        // Verify we're connected to the right database
        console.log(`Current database: ${mongoose.connection.db.databaseName}`);
        if (mongoose.connection.db.databaseName !== 'ecommerce') {
            console.log(`Switching from ${mongoose.connection.db.databaseName} to ecommerce database`);
            mongoose.connection.useDb('ecommerce');
        }
        
        let user = await User.findById(userId);
        console.log("MongoDB user query result:", user);
        
        // If user doesn't exist in database, create it using Clerk data
        if(!user){
            console.log("User not found in database - creating user");
            
            // Get user data from Clerk
            const clerkUser = await clerkClient.users.getUser(userId);
            console.log("Clerk user data:", clerkUser);
            
            if (clerkUser) {
                const userData = {
                    _id: userId,
                    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
                    email: clerkUser.emailAddresses[0]?.emailAddress || '',
                    imageUrl: clerkUser.imageUrl || '',
                };
                
                console.log("Creating user with data:", userData);
                
                // Ensure we're connected to the right database
                await connectDB();
                console.log(`Verified database before user creation: ${mongoose.connection.db.databaseName}`);
                
                user = await User.create(userData);
                console.log("User created:", user);
                console.log(`User created in database: ${mongoose.connection.db.databaseName}, collection: ${User.collection.name}`);
                
                return NextResponse.json({success:true, user, message: "User created"});
            }
            
            return NextResponse.json({success:false, message:"User not found and could not retrieve Clerk data"});
        }
        
        return NextResponse.json({success:true, user});
    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json(
          { success: false, message: error.message }
        );
    }
}