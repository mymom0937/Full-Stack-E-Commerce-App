import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import mongoose from "mongoose";
import { inngest } from "@/config/inngest"; // Import inngest client

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Helper function to update order payment status
async function updateOrderPaymentStatus(orderId, isPaid) {
  try {
    await connectDB();
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.error(`Invalid orderId format: ${orderId}`);
      return false;
    }
    
    const order = await Order.findById(orderId);
    if (order) {
      // Check if already paid to avoid duplicate updates
      if (order.isPaid && isPaid) {
        console.log(`Order ${orderId} is already marked as paid, skipping update`);
        return true;
      }
      
      order.isPaid = isPaid;
      await order.save();
      console.log(`Order ${orderId} payment status updated to ${isPaid ? 'paid' : 'unpaid'}`);

      // Send Inngest event when order is marked as paid
      if (isPaid) {
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
              isPaid: true,
              orderId: orderId
            },
          });
          
          console.log(`Sent order/created event to Inngest for order ${orderId}`);
        } catch (inngestError) {
          console.error(`Failed to send Inngest event for order ${orderId}:`, inngestError);
        }
      }
      
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
    console.log(`Processing payment intent ${paymentIntentId}, isPaid=${isPaid}`);
    
    // Get payment intent details from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log(`Payment intent metadata:`, JSON.stringify(paymentIntent.metadata));
    
    // Extract the order ID from metadata if available
    if (paymentIntent.metadata && paymentIntent.metadata.orderId) {
      const orderId = paymentIntent.metadata.orderId;
      console.log(`Found orderId in payment intent metadata: ${orderId}`);
      return await updateOrderPaymentStatus(orderId, isPaid);
    } else {
      // Try to find session that created this payment intent
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1,
      });
      
      if (sessions && sessions.data.length > 0) {
        const session = sessions.data[0];
        console.log(`Found session ${session.id} for payment intent ${paymentIntentId}`);
        
        if (session.metadata && session.metadata.orderId) {
          const orderId = session.metadata.orderId;
          console.log(`Found orderId in session metadata: ${orderId}`);
          return await updateOrderPaymentStatus(orderId, isPaid);
        } else {
          console.log(`No orderId in session metadata for session ${session.id}`);
        }
      }
      
      console.log(`No order ID found for payment intent ${paymentIntentId}`);
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
  console.log(`Stripe webhook received at ${new Date().toISOString()}`);
  
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
      console.error(`Missing signature: ${!signature}, missing webhook secret: ${!webhookSecret}`);
      return NextResponse.json(
        { success: false, message: "Missing stripe signature or webhook secret" },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`Webhook signature verified. Event ID: ${event.id}, Type: ${event.type}`);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
      console.error(`Signature: ${signature.substring(0, 20)}...`);
      console.error(`Secret length: ${webhookSecret ? webhookSecret.length : 0}`);
      return NextResponse.json(
        { success: false, message: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`Received Stripe event: ${event.type}, ID: ${event.id}`);

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded": {
        console.log(`Processing payment_intent.succeeded: ${event.data.object.id}`);
        const result = await handlePaymentIntent(event.data.object.id, true);
        console.log(`Payment intent processing result: ${result ? "success" : "failed"}`);
        break;
      }
      case "payment_intent.canceled": {
        console.log(`Processing payment_intent.canceled: ${event.data.object.id}`);
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
            if (session.metadata) {
              console.log("Session metadata:", JSON.stringify(session.metadata));
              
              // Try orderId first
              let orderId = session.metadata.orderId;
              if (orderId) {
                console.log(`Found orderId in metadata: ${orderId}`);
                const updated = await updateOrderPaymentStatus(orderId, true);
                if (updated) {
                  console.log(`Successfully updated order ${orderId}`);
                  return NextResponse.json({ received: true, updated: true, orderId });
                }
              }
              
              // Try orderIdConfirm as backup
              orderId = session.metadata.orderIdConfirm;
              if (orderId) {
                console.log(`Found orderIdConfirm in metadata: ${orderId}`);
                const updated = await updateOrderPaymentStatus(orderId, true);
                if (updated) {
                  console.log(`Successfully updated order ${orderId} using orderIdConfirm`);
                  return NextResponse.json({ received: true, updated: true, orderId });
                }
              }
            } else {
              console.log("No metadata found in checkout session");
            }
            
            // If direct orderId wasn't found or update failed, fall back to other methods
            let order = null;
            let userId = session.metadata?.userId;
            let date = null;
            let amount = null;
            
            // Try to get payment intent for additional metadata
            if (session.payment_intent) {
              try {
                const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
                console.log(`Found payment intent: ${session.payment_intent}`);
                
                if (paymentIntent.metadata && paymentIntent.metadata.orderId) {
                  const orderId = paymentIntent.metadata.orderId;
                  console.log(`Found orderId in payment intent metadata: ${orderId}`);
                  const updated = await updateOrderPaymentStatus(orderId, true);
                  if (updated) {
                    console.log(`Successfully updated order ${orderId} from payment intent metadata`);
                    return NextResponse.json({ received: true, updated: true, orderId });
                  }
                }
              } catch (piError) {
                console.error(`Error retrieving payment intent: ${piError.message}`);
              }
            }
            
            // If userId is available, try to find the most recent unpaid order for this user
            if (userId) {
              console.log(`Falling back to searching by userId: ${userId}`);
              // Try to find the order using multiple approaches
              order = await findOrderByUserIdAndDate(userId, date, amount);
              
              if (order) {
                console.log(`Found order ${order._id} to update by userId`);
                // Update the order status to paid
                order.isPaid = true;
                await order.save();
                console.log(`Order ${order._id} marked as paid through checkout session`);
                return NextResponse.json({ received: true, updated: true, orderId: order._id });
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
                  return NextResponse.json({ received: true, updated: true, orderId: mostRecentOrder._id, fallback: true });
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