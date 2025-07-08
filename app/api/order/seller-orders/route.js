import authSeller from "@/lib/authSeller";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import mongoose from "mongoose";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }
        
        await connectDB();
        
        // Direct query to orders collection for consistency with the other route
        const db = mongoose.connection.db;
        const orders = await db.collection('orders').find({}).toArray();
        
        // Clean up the orders for JSON serialization
        const cleanOrders = orders.map(order => {
            // Convert MongoDB ObjectId to string
            order._id = order._id.toString();
            return order;
        });

        return NextResponse.json({
            success: true,
            orders: cleanOrders
        }, { status: 200 });

    } catch (error) {
        console.error("Error in seller orders route:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to fetch orders"
            },
            { status: 500 }
        );
    }
}