
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import { inngest } from "@/config/inngest";
import Stripe from "stripe";
import connectDB from "@/config/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Store recent order processing to prevent duplicates
const recentOrders = new Map();
const DUPLICATE_ORDER_WINDOW_MS = 30000; // 30 seconds

// Track user's last order timestamp
const userLastOrderTimestamp = new Map();
const MIN_ORDER_INTERVAL_MS = 5000; // 5 seconds minimum between orders

// Store already processed orderRequestIds
const processedOrderRequestIds = new Map();
const ORDER_REQUEST_EXPIRY_MS = 3600000; // 1 hour

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { address, items, orderRequestId, clientTimestamp } = await request.json();
        const origin = request.headers.get("origin");
        
        console.log(`Stripe order request received for user ${userId} with requestId ${orderRequestId || 'none'}, clientTimestamp: ${clientTimestamp || 'none'}`);
        
        // Check if user has placed an order recently
        const lastOrderTime = userLastOrderTimestamp.get(userId);
        const now = Date.now();
        if (lastOrderTime && now - lastOrderTime < MIN_ORDER_INTERVAL_MS) {
          console.log(`User ${userId} placed an order too recently (${now - lastOrderTime}ms ago)`);
          return NextResponse.json({
            success: false,
            message: "You've just placed an order. Please wait a moment before placing another."
          }, { status: 429 });
        }
        
        // Check if this is an exact duplicate request with the same orderRequestId
        if (orderRequestId && processedOrderRequestIds.has(orderRequestId)) {
          console.log(`Rejected duplicate order request with ID ${orderRequestId}`);
          return NextResponse.json({
            success: false,
            message: "This order has already been processed. Please refresh the page if you'd like to place a new order."
          }, { status: 429 });
        }
        
        // Connect to database
        try {
            console.log("Connecting to MongoDB database...");
            await connectDB();
            console.log("Connected to MongoDB database successfully");
            
            // Check for existing order with the same orderRequestId
            if (orderRequestId) {
              const existingOrder = await Order.findOne({ orderRequestId });
              if (existingOrder) {
                console.log(`Found existing order with requestId ${orderRequestId}`);
                return NextResponse.json({
                  success: false,
                  message: "This order has already been placed. Check your orders page.",
                  orderId: existingOrder._id
                }, { status: 409 });
              }
            }
        } catch (dbError) {
            console.error("Error connecting to database:", dbError);
            return NextResponse.json(
                {
                    success: false,
                    message: "Database connection error. Please try again later."
                },
                { status: 500 }
            );
        }
        
        if (!address || !items || items.length === 0) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid request data. Address and items are required.",
            },
            { status: 400 }
          );
        }
        
        // Generate a unique identifier for this order request
        const orderKey = `${userId}:${JSON.stringify(items)}:${address}`;
        
        // Check if this is a duplicate order within the time window
        const lastOrderKeyTime = recentOrders.get(orderKey);
        if (lastOrderKeyTime && now - lastOrderKeyTime < DUPLICATE_ORDER_WINDOW_MS) {
          console.log(`Potential duplicate order detected for ${userId}, ignoring within ${DUPLICATE_ORDER_WINDOW_MS}ms window`);
          return NextResponse.json({
            success: false,
            message: "Order was already submitted. Please wait a moment before trying again."
          }, { status: 429 });
        }
        
        // Mark this order as being processed
        recentOrders.set(orderKey, now);
        
        // Set a timeout to remove the entry from the map after the window expires
        setTimeout(() => {
          recentOrders.delete(orderKey);
        }, DUPLICATE_ORDER_WINDOW_MS);
        
        // Mark this orderRequestId as processed
        if (orderRequestId) {
          processedOrderRequestIds.set(orderRequestId, true);
          
          // Expire the processed ID after a certain time
          setTimeout(() => {
            processedOrderRequestIds.delete(orderRequestId);
          }, ORDER_REQUEST_EXPIRY_MS);
        }
        
        // Fetch products and calculate total amount
        let totalAmount = 0;
        let lineItems = [];
        
        try {
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
        } catch (productError) {
          console.error("Error fetching products:", productError);
          return NextResponse.json(
            {
              success: false,
              message: "Error fetching product information. Please try again."
            },
            { status: 500 }
          );
        }
        
        // Add tax (2%)
        const finalAmount = totalAmount + Math.floor(totalAmount * 0.02);
        console.log(`Order amount calculated: ${finalAmount}`);
        
        // Create the order in database first so we have the orderId
        const orderData = {
          userId,
          items,
          amount: finalAmount,
          address,
          date: Date.now(),
          status: "Order Placed",
          paymentType: "Stripe",
          isPaid: false,
          orderRequestId: orderRequestId || undefined,
          clientTimestamp: clientTimestamp || undefined
        };
        
        let orderId;
        
        // Create order in database
        try {
          const order = new Order(orderData);
          const savedOrder = await order.save();
          orderId = savedOrder._id.toString();
          console.log(`Created order with ID: ${orderId}`);
          
          // Update the user's last order timestamp
          userLastOrderTimestamp.set(userId, Date.now());
          
          // Set a timeout to remove the timestamp after the window expires
          setTimeout(() => {
            userLastOrderTimestamp.delete(userId);
          }, MIN_ORDER_INTERVAL_MS * 2);
          
          // DEBUG: Log the full order data
          console.log(`Full order data: ${JSON.stringify(savedOrder)}`);
        } catch (orderError) {
          console.error("Error creating order:", orderError);
          return NextResponse.json(
            {
              success: false,
              message: "Error creating order. Please try again."
            },
            { status: 500 }
          );
        }
        
        // Create a Stripe Checkout session with the orderId in metadata
        try {
          const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: 'payment',
            success_url: `${origin}/order-placed?order_id=${orderId}`,
            cancel_url: `${origin}/cart`,
            metadata: {
              orderId, // Include the orderId directly in metadata
              userId,
              address,
              orderIdConfirm: orderId, // Duplicate the orderId with a different name for redundancy
            },
            payment_intent_data: {
              metadata: {
                orderId, // Also include orderId in payment_intent metadata
              },
            },
          });
          
          // Log the created session ID for debugging
          console.log(`Created Stripe session ID: ${session.id} for order: ${orderId}`);
          
          // Update the order with the session ID for reference
          try {
            const savedOrder = await Order.findById(orderId);
            if (savedOrder) {
              savedOrder.stripeSessionId = session.id;
              await savedOrder.save();
            }
          } catch (updateError) {
            console.error("Error updating order with session ID:", updateError);
            // Continue anyway since the main functionality works
          }
          
          return NextResponse.json({
            success: true,
            url: session.url
          });
        } catch (stripeError) {
          console.error("Stripe session creation error:", stripeError);
          
          // Try to delete the order since Stripe checkout failed
          try {
            await Order.findByIdAndDelete(orderId);
          } catch (deleteError) {
            console.error("Error deleting failed order:", deleteError);
          }
          
          return NextResponse.json(
            {
              success: false,
              message: "Error creating payment session. Please try again."
            },
            { status: 500 }
          );
        }
    } catch (error) {
        console.error("Stripe route error:", error);
        return NextResponse.json(
          {
            success: false,
            message: "An unexpected error occurred. Please try again later."
          },
          { status: 500 }
        );
    }
}