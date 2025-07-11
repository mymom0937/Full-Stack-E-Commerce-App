import connectDB from "@/config/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required",
        },
        { status: 400 }
      );
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }
    
    // Update payment status
    order.isPaid = true;
    await order.save();
    
    return NextResponse.json({
      success: true,
      message: "Order payment status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order payment:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
} 