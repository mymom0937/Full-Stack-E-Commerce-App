
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
            const origin = request.headers.get("origin")
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
            let productData = [];
            // Calculate total amount - fixing the async reduce function
            let totalAmount = 0;
            for (const item of items) {
              const product = await Product.findById(item.product);
              productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
              })
            }
            
            // Add tax (2%)
            const finalAmount = totalAmount + Math.floor(totalAmount * 0.02);
            
            console.log(`Order amount calculated: ${finalAmount}`);
        
         const order= await inngest.send({
              name: "order/created",
              data: {
                userId,
                address,
                items,
                amount: finalAmount, // Make sure this is 'amount' not 'ammount'
                date: Date.now(),
                paymentType: "Stripe", // Assuming default payment type is COD
                isPaid: false, // Add isPaid field with default value false for COD
              },
            });
    //   create line items for stripe payment
      const line_items = items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // Convert to cents
        },
        quantity: item.quantity,
      }));

    //   Create a Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
        line_items,
            mode: 'payment',
            success_url: `${origin}/order-placed`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(), // Include the order ID in metadata
                userId, // Include user ID for reference
            },
        });
        const url= session.url;
    
        return NextResponse.json({
            success: true,
            url
        });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message
            }
        );
        
    }
}