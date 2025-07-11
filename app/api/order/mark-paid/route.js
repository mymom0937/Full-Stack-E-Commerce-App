import connectDB from "@/config/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Stripe session ID is required",
        },
        { status: 400 }
      );
    }
    
    // Find order by Stripe session ID
    const orders = await Order.find({ 
      'stripeSessionId': sessionId 
    });
    
    if (orders && orders.length > 0) {
      // Update the order
      const order = orders[0];
      order.isPaid = true;
      await order.save();
      
      return NextResponse.json({
        success: true,
        message: "Order payment status updated successfully",
        orderId: order._id,
      });
    }
    
    // If no order found with the session ID, try to find the most recent order
    const recentOrders = await Order.find({
      paymentType: "Stripe",
      isPaid: false
    }).sort({ date: -1 }).limit(1);
    
    if (recentOrders && recentOrders.length > 0) {
      const recentOrder = recentOrders[0];
      recentOrder.isPaid = true;
      recentOrder.stripeSessionId = sessionId;
      await recentOrder.save();
      
      return NextResponse.json({
        success: true,
        message: "Recent order marked as paid",
        orderId: recentOrder._id,
      });
    }
    
    return NextResponse.json(
      {
        success: false,
        message: "No matching order found",
      },
      { status: 404 }
    );
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