import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { Inngest } from "inngest";
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
    // Calculate total amount
    const amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return acc + product.offerPrice * item.quantity;
    }, 0);

    await Inngest.send({
      name: "order/created",
      data: {
        userId,
        address,
        items,
        amount: amount + Math.floor(amount * 0.02), 
        date:Date.now(),
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
