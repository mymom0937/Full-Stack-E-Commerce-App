import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Helper function to update order payment status
async function updateOrderPaymentStatus(orderId, isPaid) {
  try {
    await connectDB();
    const order = await Order.findById(orderId);
    if (order) {
      order.isPaid = isPaid;
      await order.save();
      console.log(`Order ${orderId} payment status updated to ${isPaid ? 'paid' : 'unpaid'}`);
      return true;
    } else {
      console.log(`Order ${orderId} not found`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error);
    return false;
  }
}

// Handle payment intent events
async function handlePaymentIntent(paymentIntentId, isPaid) {
  try {
    await connectDB();
    // Get payment intent details from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Extract the order ID from metadata if available
    if (paymentIntent.metadata && paymentIntent.metadata.orderId) {
      const orderId = paymentIntent.metadata.orderId;
      return await updateOrderPaymentStatus(orderId, isPaid);
    } else {
      console.log(`No order ID found in payment intent ${paymentIntentId} metadata`);
      return false;
    }
  } catch (error) {
    console.error(`Error handling payment intent ${paymentIntentId}:`, error);
    return false;
  }
}

// Find the most recent order for a user
async function findOrderByUserIdAndDate(userId, date, amount) {
  try {
    await connectDB();
    console.log(`Looking for order with userId: ${userId}, date: ${date}, amount: ${amount}`);
    
    // Try to find the order with an exact match
    let orders = await Order.find({
      userId: userId,
      date: date
    }).sort({ createdAt: -1 }).limit(5);
    
    if (orders.length > 0) {
      console.log(`Found ${orders.length} orders with exact date match`);
      // Return the most recent one
      return orders[0];
    }
    
    // If not found with exact date, try to find by userId and approximate date
    // (within 5 minutes before or after the specified date)
    const fiveMinutesInMillis = 5 * 60 * 1000;
    orders = await Order.find({
      userId: userId,
      date: { 
        $gte: date - fiveMinutesInMillis,
        $lte: date + fiveMinutesInMillis
      }
    }).sort({ createdAt: -1 }).limit(5);
    
    if (orders.length > 0) {
      console.log(`Found ${orders.length} orders with approximate date match`);
      return orders[0];
    }
    
    // If still not found, try to find most recent order by this user
    orders = await Order.find({
      userId: userId,
      paymentType: "Stripe",
      isPaid: false
    }).sort({ date: -1 }).limit(5);
    
    if (orders.length > 0) {
      console.log(`Found ${orders.length} unpaid Stripe orders for this user`);
      return orders[0];
    }
    
    // If amount is provided, try to find by amount
    if (amount) {
      orders = await Order.find({
        userId: userId,
        amount: amount,
        isPaid: false
      }).sort({ date: -1 }).limit(5);
      
      if (orders.length > 0) {
        console.log(`Found ${orders.length} orders with matching amount`);
        return orders[0];
      }
    }
    
    console.log(`No matching order found for userId: ${userId}`);
    return null;
  } catch (error) {
    console.error("Error finding order:", error);
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { success: false, message: "Missing stripe signature or webhook secret" },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { success: false, message: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`Received Stripe event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded": {
        await handlePaymentIntent(event.data.object.id, true);
        break;
      }
      case "payment_intent.canceled": {
        await handlePaymentIntent(event.data.object.id, false);
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Received checkout.session.completed event:", JSON.stringify(session));
        
        // Check if payment was successful
        if (session.payment_status === "paid") {
          // Connect to database
          await connectDB();
          
          try {
            // Look for orderId directly in the metadata - this should be our primary approach now
            if (session.metadata && session.metadata.orderId) {
              console.log(`Found orderId in metadata: ${session.metadata.orderId}`);
              const updated = await updateOrderPaymentStatus(session.metadata.orderId, true);
              if (updated) {
                console.log(`Successfully updated order ${session.metadata.orderId}`);
                return NextResponse.json({ received: true, updated: true });
              }
            }
            
            // If direct orderId wasn't found or update failed, fall back to other methods
            let order = null;
            let userId = session.metadata?.userId;
            let date = null;
            let amount = null;
            
            // If userId is available, try to find the most recent unpaid order for this user
            if (userId) {
              // Try to find the order using multiple approaches
              order = await findOrderByUserIdAndDate(userId, date, amount);
              
              if (order) {
                console.log(`Found order ${order._id} to update`);
                // Update the order status to paid
                order.isPaid = true;
                await order.save();
                console.log(`Order ${order._id} marked as paid through checkout session`);
              } else {
                console.log("No matching order found to mark as paid");
                
                // Last resort - try to find ANY unpaid Stripe order
                const unpaidOrders = await Order.find({
                  paymentType: "Stripe", 
                  isPaid: false
                }).sort({ createdAt: -1 }).limit(5);
                
                console.log(`Found ${unpaidOrders.length} total unpaid Stripe orders`);
                if (unpaidOrders.length > 0) {
                  // Update the most recent unpaid Stripe order
                  const mostRecentOrder = unpaidOrders[0];
                  mostRecentOrder.isPaid = true;
                  await mostRecentOrder.save();
                  console.log(`Updated most recent unpaid order: ${mostRecentOrder._id}`);
                }
              }
            }
          } catch (dbError) {
            console.error("Error updating order payment status:", dbError);
          }
        } else {
          console.log(`Payment status is not 'paid'. Current status: ${session.payment_status}`);
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 