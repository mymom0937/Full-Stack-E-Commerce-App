import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        // Direct query to orders collection
        const db = mongoose.connection.db;
        const orders = await db.collection('orders').find({ userId }).toArray();
        
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
        console.error("Error in order list route:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to fetch orders"
            },
            { status: 500 }
        );
    }
}