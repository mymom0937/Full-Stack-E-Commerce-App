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

// Track user's last order timestamp
const userLastOrderTimestamp = new Map();
const MIN_ORDER_INTERVAL_MS = 5000; // 5 seconds minimum between orders

// A simple mutex implementation to ensure only one order is processed at a time per user
const userOrderLocks = new Map();

// Function to wait for a specific amount of time
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { address, items, orderRequestId, clientTimestamp } = await request.json();
    
    console.log(`Order request received for user ${userId} with requestId ${orderRequestId || 'none'}, clientTimestamp: ${clientTimestamp || 'none'}`);
    
    // Check if user has placed an order recently
    const lastOrderTime = userLastOrderTimestamp.get(userId);
    const now = Date.now();
    if (lastOrderTime && now - lastOrderTime < MIN_ORDER_INTERVAL_MS) {
      console.log(`User ${userId} placed an order too recently (${now - lastOrderTime}ms ago)`);
      return NextResponse.json({
        success: false,
        message: "You've just placed an order. Please wait a moment before placing another."
      }, { status: 429 });
    }
    
    // Check if user has a lock that's less than 10 seconds old
    const existingLock = userOrderLocks.get(userId);
    if (existingLock && Date.now() - existingLock < 10000) {
      console.log(`User ${userId} has a recent order in progress, rejecting duplicate`);
      return NextResponse.json({
        success: false,
        message: "You already have an order being processed. Please wait for it to complete."
      }, { status: 429 });
    }
    
    // Set the lock for this user
    userOrderLocks.set(userId, Date.now());
    console.log(`Lock acquired for user ${userId}`);
    
    try {
      // Check if this is an exact duplicate request with the same orderRequestId
      if (orderRequestId && processedOrderRequestIds.has(orderRequestId)) {
        console.log(`Rejected duplicate order request with ID ${orderRequestId}`);
        return NextResponse.json({
          success: false,
          message: "This order has already been processed. Please refresh the page if you'd like to place a new order."
        }, { status: 429 });
      }
      
      // Check for existing order with the same orderRequestId
      try {
        // Connect to database with detailed logging
        console.log("Connecting to MongoDB database...");
        await connectDB();
        console.log(`Connected to MongoDB database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
        
        const existingOrder = await Order.findOne({ orderRequestId });
        if (existingOrder) {
          console.log(`Found existing order with requestId ${orderRequestId}`);
          return NextResponse.json({
            success: false,
            message: "This order has already been placed. Check your orders page.",
            orderId: existingOrder._id
          }, { status: 409 });
        }
      } catch (dbError) {
        console.error("Error checking for existing order:", dbError);
        // Continue processing as this is just a precautionary check
      }
      
      if (!address || !items || items.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid request data. Address and items are required.",
          },
          { status: 400 }
        );
      }
      
      // Calculate total amount
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
        orderRequestId: orderRequestId || undefined,
        clientTimestamp: clientTimestamp || undefined
      };
  
      console.log("Order data to be saved:", JSON.stringify(orderData));
      
      // Mark this orderRequestId as processed BEFORE creating the order
      // to prevent race conditions
      if (orderRequestId) {
        processedOrderRequestIds.set(orderRequestId, true);
        
        // Expire the processed ID after a certain time
        setTimeout(() => {
          processedOrderRequestIds.delete(orderRequestId);
        }, ORDER_REQUEST_EXPIRY_MS);
      }
      
      let orderId;
      
      // Create the order directly in the database
      try {
        const order = new Order(orderData);
        const savedOrder = await order.save();
        orderId = savedOrder._id.toString();
        console.log("Order created in MongoDB:", orderId);
        
        // Update the user's last order timestamp
        userLastOrderTimestamp.set(userId, Date.now());
        
        // Set a timeout to remove the timestamp after the window expires
        setTimeout(() => {
          userLastOrderTimestamp.delete(userId);
        }, MIN_ORDER_INTERVAL_MS * 2);
      } catch (dbError) {
        console.error("Error saving order to database:", dbError);
        console.error("Error details:", dbError.message);
        
        if (dbError.code === 11000) {
          // This is a duplicate key error, which means we tried to create a duplicate order
          console.log("Duplicate key error - order with this orderRequestId already exists");
          return NextResponse.json({
            success: false,
            message: "This order has already been processed. Please check your orders page."
          }, { status: 409 });
        }
        
        // Try direct insert as a fallback
        try {
          console.log("Trying direct MongoDB insert as fallback...");
          const result = await mongoose.connection.db.collection('orders').insertOne(orderData);
          orderId = result.insertedId.toString();
          console.log("Order created directly in MongoDB:", orderId);
          
          // Update the user's last order timestamp
          userLastOrderTimestamp.set(userId, Date.now());
        } catch (directError) {
          console.error("Direct MongoDB insert also failed:", directError.message);
          throw directError; // Re-throw to be caught by the outer catch
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
      try {
        const user = await User.findById(userId);
        if (user) {
          user.cartItems = {};
          await user.save();
        }
      } catch (cartError) {
        console.error("Error clearing user cart:", cartError);
        // Continue anyway since the order was created
      }
      
      return NextResponse.json({
        success: true,
        message: "Order created successfully",
        orderId: orderId
      });
    } finally {
      // Always release the lock when we're done
      userOrderLocks.delete(userId);
      console.log(`Lock released for user ${userId}`);
      
      // Set a timeout to clean up the lock if something goes wrong
      setTimeout(() => {
        if (userOrderLocks.has(userId)) {
          userOrderLocks.delete(userId);
          console.log(`Force-released lock for user ${userId} after timeout`);
        }
      }, 10000);
    }
  } catch (error) {
    console.error("Error in order creation:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
