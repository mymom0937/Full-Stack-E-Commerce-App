import connectDB from "@/config/db.js";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const requestBody = await request.json();
    console.log("Request body received:", requestBody);
    const { address } = requestBody;
    console.log("Address extracted:", address);
    
    if (!address) {
      return NextResponse.json({
        success: false,
        message: "Address data is missing",
      }, { status: 400 });
    }
    
    await connectDB();

    // Make sure all required fields are present
    if (!address.fullName || !address.phoneNumber || !address.pincode || 
        !address.area || !address.city || !address.state) {
      console.log("Missing required fields in address:", address);
      return NextResponse.json({
        success: false,
        message: "All address fields are required",
        receivedData: address
      }, { status: 400 });
    }

    const addressData = { 
      userId, 
      fullName: address.fullName, 
      phoneNumber: address.phoneNumber,
      pincode: address.pincode,
      area: address.area,
      city: address.city,
      state: address.state
    };

    console.log("Creating address with data:", addressData);
    const newAddress = await Address.create(addressData);
    console.log("New address created:", newAddress);

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      newAddress,
    });
  } catch (error) {
    console.error("Error in add-address route:", error);
    return NextResponse.json({
      success: false,
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
