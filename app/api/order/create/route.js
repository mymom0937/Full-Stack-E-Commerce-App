import connectDB from "@/config/db";
import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { address, items } = await request.json();
    await connectDB();
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

    await inngest.send({
      name: "order/created",
      data: {
        userId,
        address,
        items,
        amount: finalAmount, // Make sure this is 'amount' not 'ammount'
        date: Date.now(),
      },
    });
    
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
