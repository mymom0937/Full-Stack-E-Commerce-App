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
        
        // Check if payment was successful
        if (session.payment_status === "paid") {
          // Connect to database
          await connectDB();
          
          try {
            // Extract order data from metadata
            if (session.metadata) {
              // If orderId is directly available in metadata
              if (session.metadata.orderId) {
                await updateOrderPaymentStatus(session.metadata.orderId, true);
              } 
              // If we stored orderData JSON
              else if (session.metadata.orderData) {
                const orderData = JSON.parse(session.metadata.orderData);
                
                // Find the order with matching date and userId
                const orders = await Order.find({
                  userId: orderData.userId || session.metadata.userId,
                  date: { $eq: orderData.date }
                });
                
                if (orders.length > 0) {
                  // Update the most recent order that matches
                  const order = orders[orders.length - 1];
                  
                  // Update the order status to paid
                  order.isPaid = true;
                  await order.save();
                  
                  console.log(`Order ${order._id} marked as paid through checkout session`);
                } else {
                  console.log("No matching order found to mark as paid");
                }
              }
            } else {
              console.log("No metadata found in checkout session");
            }
          } catch (dbError) {
            console.error("Error updating order payment status:", dbError);
          }
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