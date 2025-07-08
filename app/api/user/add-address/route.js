import connectDB from "@/config/db.js";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Get the clerk auth data from request
    const authData = getAuth(request);
    console.log("Auth data available:", authData ? "yes" : "no");

    // Get the authorization header to log it for debugging
    const authHeader = request.headers.get('authorization');
    console.log("Authorization header present:", authHeader ? "yes" : "no");
    
    // Extract userId from auth data
    const userId = authData?.userId;
    console.log("User ID from auth:", userId);
    
    if (!userId) {
      // If no userId, try to get it from request body as fallback
      const requestBody = await request.json();
      console.log("Request body received:", requestBody);
      
      if (!requestBody.userId) {
        console.error("Authentication failed - no userId found");
        return NextResponse.json({
          success: false,
          message: "Authentication failed. Please sign in again.",
        }, { status: 401 });
      }
      
      const { address } = requestBody;
      const bodyUserId = requestBody.userId;
      
      console.log("Using userId from request body:", bodyUserId);
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
        userId: bodyUserId, 
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
    } else {
      // We have a userId from auth, proceed normally
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
    }
  } catch (error) {
    console.error("Error in add-address route:", error);
    return NextResponse.json({
      success: false,
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
