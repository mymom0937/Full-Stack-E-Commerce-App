import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Address from "@/models/Address";
import { verifyAuth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    // Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Verify authentication - pass the request object
    const { userId, error } = await verifyAuth(request);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status: 401 });
    }

    // Connect to the database
    await connectDB();

    // Find the order by ID
    const order = await Order.findById(id);

    // Check if order exists
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Check if the order belongs to the authenticated user
    if (order.user && order.user.toString() !== userId && 
        order.seller && order.seller.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to this order" },
        { status: 403 }
      );
    }

    // Manually fetch related data instead of using populate
    let orderData = order.toObject();
    
    // Fetch address if it exists
    if (order.address) {
      try {
        const addressData = await Address.findById(order.address);
        if (addressData) {
          orderData.address = addressData;
        }
      } catch (err) {
        console.log("Error fetching address:", err);
        // Keep the address ID if we can't fetch the full address
      }
    }
    
    // Fetch product details if they exist
    if (order.items && Array.isArray(order.items)) {
      const productIds = order.items.map(item => item.product).filter(Boolean);
      if (productIds.length > 0) {
        const products = await mongoose.connection.db.collection('products').find({
          _id: { $in: productIds.map(id => {
            try {
              return new mongoose.Types.ObjectId(id);
            } catch (e) {
              return id; // Keep as string if not a valid ObjectId
            }
          })}
        }).toArray();
        
        // Create a map of products by ID for easy lookup
        const productMap = {};
        products.forEach(product => {
          productMap[product._id.toString()] = product;
        });
        
        // Add product details to each item
        orderData.items = order.items.map(item => {
          const productId = item.product?.toString();
          const productDetails = productId ? productMap[productId] : null;
          return {
            ...item,
            product: productDetails || item.product
          };
        });
      }
    }

    return NextResponse.json({ success: true, order: orderData });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order details" },
      { status: 500 }
    );
  }
} 