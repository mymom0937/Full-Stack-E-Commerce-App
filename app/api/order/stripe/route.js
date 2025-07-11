
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import { inngest } from "@/config/inngest";
import Stripe from "stripe";
import connectDB from "@/config/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { address, items } = await request.json();
        const origin = request.headers.get("origin");
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
        
        // Fetch products and calculate total amount
        let totalAmount = 0;
        let lineItems = [];
        
        for (const item of items) {
          const product = await Product.findById(item.product);
          if (!product) {
            return NextResponse.json(
              {
                success: false,
                message: `Product not found: ${item.product}`,
              },
              { status: 404 }
            );
          }
          
          // Calculate price for this product
          const itemPrice = product.offerPrice * item.quantity;
          totalAmount += itemPrice;
          
          // Add to line items for Stripe
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: product.name,
                description: product.description?.substring(0, 100) || '',
              },
              unit_amount: product.offerPrice * 100, // Convert to cents
            },
            quantity: item.quantity,
          });
        }
        
        // Add tax (2%)
        const finalAmount = totalAmount + Math.floor(totalAmount * 0.02);
        console.log(`Order amount calculated: ${finalAmount}`);
        
        // Store metadata for the order
        const orderMetadata = {
          userId,
          address,
          items: JSON.stringify(items),
          amount: finalAmount,
          date: Date.now(),
        };
        
        // Create a Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
          line_items: lineItems,
          mode: 'payment',
          success_url: `${origin}/order-placed?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/cart`,
          metadata: {
            userId,
            address,
            orderData: JSON.stringify(orderMetadata),
          },
        });
        
        // Send event to Inngest
        await inngest.send({
          name: "order/created",
          data: {
            userId,
            address,
            items,
            amount: finalAmount,
            date: Date.now(),
            paymentType: "Stripe",
            isPaid: false,
            stripeSessionId: session.id,
          },
        });
        
        return NextResponse.json({
          success: true,
          url: session.url
        });

    } catch (error) {
        console.error("Stripe error:", error);
        return NextResponse.json(
          {
            success: false,
            message: error.message
          },
          { status: 500 }
        );
    }
}