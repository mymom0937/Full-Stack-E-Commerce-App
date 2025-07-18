import connectDB from "@/config/db";
import { inngest } from "@/config/inngest";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Store recent order processing to prevent duplicates
const recentOrders = new Map();
const DUPLICATE_ORDER_WINDOW_MS = 30000; // 30 seconds

// Store already processed orderRequestIds
const processedOrderRequestIds = new Map();
const ORDER_REQUEST_EXPIRY_MS = 3600000; // 1 hour

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { address, items, orderRequestId } = await request.json();
    
    // Check if this is an exact duplicate request with the same orderRequestId
    if (orderRequestId && processedOrderRequestIds.has(orderRequestId)) {
      console.log(`Rejected duplicate order request with ID ${orderRequestId}`);
      return NextResponse.json({
        success: false,
        message: "This order has already been processed. Please refresh the page if you'd like to place a new order."
      }, { status: 429 });
    }
    
    // Generate a unique identifier for this order request
    const orderKey = `${userId}:${JSON.stringify(items)}:${address}`;
    
    // Check if this is a duplicate order within the time window
    const lastOrderTime = recentOrders.get(orderKey);
    const now = Date.now();
    if (lastOrderTime && now - lastOrderTime < DUPLICATE_ORDER_WINDOW_MS) {
      console.log(`Potential duplicate order detected for ${userId}, ignoring within ${DUPLICATE_ORDER_WINDOW_MS}ms window`);
      return NextResponse.json({
        success: false,
        message: "Order was already submitted. Please wait a moment before trying again."
      }, { status: 429 });
    }
    
    // Mark this order as being processed
    recentOrders.set(orderKey, now);
    
    // Set a timeout to remove the entry from the map after the window expires
    setTimeout(() => {
      recentOrders.delete(orderKey);
    }, DUPLICATE_ORDER_WINDOW_MS);
    
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
    
    // Check for recent orders in the database as a second layer of protection
    const recentDbOrder = await Order.findOne({
      userId,
      address,
      'items.product': { $all: items.map(item => item.product) },
      date: { $gt: Date.now() - 60000 } // Orders within the last minute
    });

    if (recentDbOrder) {
      console.log(`Duplicate order detected in database for user ${userId}`);
      return NextResponse.json({
        success: false,
        message: "You have recently placed a similar order. Please wait before placing another."
      }, { status: 429 });
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
      status: "Order Placed",
      // Store the orderRequestId for future duplicate detection
      orderRequestId: orderRequestId || undefined
    };

    console.log("Order data to be saved:", JSON.stringify(orderData));
    
    let orderId;
    
    // Create the order directly in the database
    try {
      const order = new Order(orderData);
      const savedOrder = await order.save();
      orderId = savedOrder._id.toString();
      console.log("Order created in MongoDB:", orderId);
      
      // Mark this orderRequestId as processed
      if (orderRequestId) {
        processedOrderRequestIds.set(orderRequestId, true);
        
        // Expire the processed ID after a certain time
        setTimeout(() => {
          processedOrderRequestIds.delete(orderRequestId);
        }, ORDER_REQUEST_EXPIRY_MS);
      }
    } catch (dbError) {
      console.error("Error saving order to database:", dbError);
      console.error("Error details:", dbError.message);
      
      // Try direct insert as a fallback
      try {
        console.log("Trying direct MongoDB insert as fallback...");
        const result = await mongoose.connection.db.collection('orders').insertOne(orderData);
        orderId = result.insertedId.toString();
        console.log("Order created directly in MongoDB:", orderId);
        
        // Mark this orderRequestId as processed
        if (orderRequestId) {
          processedOrderRequestIds.set(orderRequestId, true);
          
          // Expire the processed ID after a certain time
          setTimeout(() => {
            processedOrderRequestIds.delete(orderRequestId);
          }, ORDER_REQUEST_EXPIRY_MS);
        }
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
    
    // Clean up this order from the recent orders map
    recentOrders.delete(orderKey);
    
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
