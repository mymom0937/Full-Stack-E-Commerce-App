import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { inngest } from "@/config/inngest";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId, triggerInngest } = await request.json();
    await connectDB();

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Check if the order belongs to the authenticated user
    if (order.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to this order" },
        { status: 403 }
      );
    }

    // Update order payment status if needed
    let updated = false;
    if (order.paymentType === "Stripe" && !order.isPaid) {
      order.isPaid = true;
      await order.save();
      updated = true;
    }

    // Trigger Inngest event if requested
    if (triggerInngest) {
      try {
        // Convert order to a plain object for Inngest
        const orderData = order.toObject();
        
        // Send the order/created event to Inngest
        await inngest.send({
          name: "order/created",
          data: {
            userId: orderData.userId,
            items: orderData.items,
            amount: orderData.amount,
            address: orderData.address,
            date: orderData.date,
            paymentType: orderData.paymentType || "Stripe",
            isPaid: orderData.isPaid,
            orderId: orderId
          },
        });
        
        console.log(`Manually triggered order/created event to Inngest for order ${orderId}`);
        
        return NextResponse.json({
          success: true,
          updated,
          inngestTriggered: true,
          message: `Order ${updated ? 'updated and ' : ''}Inngest event triggered`
        });
      } catch (inngestError) {
        console.error(`Failed to send Inngest event for order ${orderId}:`, inngestError);
        return NextResponse.json({
          success: false,
          updated,
          inngestTriggered: false,
          message: `Order ${updated ? 'updated but ' : ''}failed to trigger Inngest event: ${inngestError.message}`
        });
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      message: updated ? "Order payment status updated" : "Order already paid"
    });
  } catch (error) {
    console.error("Error fixing payment:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 