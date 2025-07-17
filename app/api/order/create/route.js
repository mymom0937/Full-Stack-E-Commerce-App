import connectDB from "@/config/db";
import { inngest } from "@/config/inngest";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { address, items } = await request.json();
    
    // Connect to database with detailed logging
    console.log("Connecting to MongoDB database...");
    await connectDB();
    console.log(`Connected to MongoDB database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
    
    if (!address || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data. Address and items are required.",
        },
        { status: 400 }
      );
    }
    
    // Calculate total amount - fixing the async reduce function
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        totalAmount += product.offerPrice * item.quantity;
      }
    }
    
    // Add tax (2%)
    const finalAmount = totalAmount + Math.floor(totalAmount * 0.02);
    
    console.log(`Order amount calculated: ${finalAmount}`);

    // Create order data
    const orderData = {
      userId,
      address,
      items,
      amount: finalAmount,
      date: Date.now(),
      paymentType: "COD", // Default payment type for this route is COD
      isPaid: false, // Default for COD is unpaid
      status: "Order Placed"
    };

    console.log("Order data to be saved:", JSON.stringify(orderData));
    
    let orderId;
    
    // Create the order directly in the database
    try {
      const order = new Order(orderData);
      const savedOrder = await order.save();
      orderId = savedOrder._id.toString();
      console.log("Order created in MongoDB:", orderId);
    } catch (dbError) {
      console.error("Error saving order to database:", dbError);
      console.error("Error details:", dbError.message);
      
      // Try direct insert as a fallback
      try {
        console.log("Trying direct MongoDB insert as fallback...");
        const result = await mongoose.connection.db.collection('orders').insertOne(orderData);
        orderId = result.insertedId.toString();
        console.log("Order created directly in MongoDB:", orderId);
      } catch (directError) {
        console.error("Direct MongoDB insert also failed:", directError.message);
      }
    }

    // Send to Inngest first (prioritize this)
    try {
      console.log("Sending event to Inngest...");
      
      // Include orderId in the data if available
      const inngestData = {
        ...orderData,
        ...(orderId && { orderId })
      };
      
      await inngest.send({
        name: "order/created",
        data: inngestData
      });
      
      console.log("Order event sent to Inngest successfully");
    } catch (inngestError) {
      console.error("Error sending event to Inngest:", inngestError);
      console.error("Inngest error details:", inngestError.message);
      // Continue execution even if Inngest fails - we already saved to DB
    }
    
    // clear user cart
    const user = await User.findById(userId);
    user.cartItems = {};
    await user.save();
    
    return NextResponse.json({
      success: true,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error in order creation:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
