import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db.js";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        await connectDB();
        
        // Fetch the address for the user
        const address = await Address.find({ userId });
        if (!address) {
            return NextResponse.json({
                success: false,
                message: "Address not found",
            });
        }
        return NextResponse.json({
            success: true,
            address,
        });

} catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message,
        });
    }
}