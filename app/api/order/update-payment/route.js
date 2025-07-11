import connectDB from "@/config/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    
    const { orderId, fixAll } = await request.json();
    
    if (fixAll) {
      // Update all Stripe orders to paid
      const result = await Order.updateMany(
        { paymentType: "Stripe" },
        { $set: { isPaid: true } }
      );
      
      return NextResponse.json({
        success: true,
        message: `Fixed ${result.modifiedCount} Stripe orders`,
      });
    } else if (orderId) {
      // Update a specific order
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
    } else {
      // If no parameters provided, update the most recent orders
      const recentOrders = await Order.find({ paymentType: "Stripe", isPaid: false })
        .sort({ date: -1 })
        .limit(5);
        
      if (recentOrders.length === 0) {
        return NextResponse.json({
          success: false,
          message: "No unpaid Stripe orders found",
        });
      }
      
      // Update all found orders
      let updatedCount = 0;
      for (const order of recentOrders) {
        order.isPaid = true;
        await order.save();
        updatedCount++;
      }
      
      return NextResponse.json({
        success: true,
        message: `Updated ${updatedCount} recent orders`,
      });
    }
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