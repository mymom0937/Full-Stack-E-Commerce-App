import connectDB from "@/config/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import User from "@/models/User";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    const handlePaymentIntent = async (paymentIntentId, isPaid) => {
      const session = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      if (!session.data || session.data.length === 0) {
        console.error(`No session found for payment intent: ${paymentIntentId}`);
        return;
      }

      const metadata = session.data[0].metadata || {};
      const orderId = metadata.orderId;
      const userId = metadata.userId;
      
      if (!orderId) {
        console.error(`No orderId found in session metadata`);
        return;
      }
      
      await connectDB();
      if (isPaid) {
        await Order.findByIdAndUpdate(orderId, {
          isPaid: true,
          paymentType: "Stripe",
        });
        
        if (userId) {
          await User.findByIdAndUpdate(userId, { cartItems: {} });
        }
      }
    };

    switch (event.type) {
      case "payment_intent.succeeded": {
        await handlePaymentIntent(event.data.object.id, true);
        break;
      }
      case "payment_intent.canceled": {
        await handlePaymentIntent(event.data.object.id, false);
        break;
      }
      default:
        console.error(event.type);
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);
    return NextResponse.json({ message: error.message });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle raw body
  },
};
