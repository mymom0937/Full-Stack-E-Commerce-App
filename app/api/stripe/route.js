import connectDB from "@/config/db";
import Order from "@/models/Order";
import { connect } from "mongoose";
import Script from "next/script";
import { NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.text();
    sig = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const handlePaymentIntent = async (paymentIntentId) => {
      const session = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId, userId } = session.data[0].metadata;
      await connectDB();
      if (isPaid) {
        await Order.findByIdAndUpdate(orderId, {
          isPaid: true,
          paymentType: "Stripe",
        });
        await User.findByIdAndUpdate(userId, { cartItems: {} });
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
