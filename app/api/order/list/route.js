import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        // Direct query to orders collection - show all orders for this user
        const db = mongoose.connection.db;
        const orders = await db.collection('orders').find({ userId }).toArray();
        
        // Get all product IDs from orders
        const productIds = new Set();
        for (const order of orders) {
            if (Array.isArray(order.items)) {
                order.items.forEach(item => {
                    if (item.product) {
                        productIds.add(item.product);
                    }
                });
            }
        }
        
        // Fetch all products in a single query
        const products = productIds.size > 0 
            ? await db.collection('products').find({ 
                _id: { $in: Array.from(productIds).map(id => {
                    try {
                        return new mongoose.Types.ObjectId(id);
                    } catch (e) {
                        return id; // Keep as string if not a valid ObjectId
                    }
                })} 
            }).toArray() 
            : [];
        
        // Get all address IDs from orders
        const addressIds = new Set();
        for (const order of orders) {
            if (order.address && typeof order.address === 'string') {
                addressIds.add(order.address);
            }
        }
        
        // Fetch all addresses in a single query
        const addresses = addressIds.size > 0 
            ? await db.collection('addresses').find({ 
                _id: { $in: Array.from(addressIds).map(id => {
                    try {
                        return new mongoose.Types.ObjectId(id);
                    } catch (e) {
                        return id; // Keep as string if not a valid ObjectId
                    }
                })} 
            }).toArray() 
            : [];
        
        // Create lookup maps
        const productsMap = {};
        products.forEach(product => {
            productsMap[product._id.toString()] = product;
        });
        
        const addressesMap = {};
        addresses.forEach(address => {
            addressesMap[address._id.toString()] = address;
        });
        
        // Clean up the orders and add details
        const cleanOrders = orders.map(order => {
            // Convert MongoDB ObjectId to string
            const orderId = order._id.toString();
            
            // Process items to include product details
            const items = Array.isArray(order.items) ? order.items.map(item => {
                const productId = item.product?.toString() || item.product;
                const productDetails = productsMap[productId] || null;
                
                return {
                    ...item,
                    productName: productDetails?.name || "Product",
                    productDetails
                };
            }) : [];
            
            // Include address details
            let addressDetails = null;
            if (order.address && typeof order.address === 'string') {
                addressDetails = addressesMap[order.address] || null;
            }
            
            return {
                ...order,
                _id: orderId,
                items,
                addressDetails
            };
        });

        return NextResponse.json({ 
            success: true,
            orders: cleanOrders 
        }, { status: 200 });

    } catch (error) {
        console.error("Error in order list route:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to fetch orders"
            },
            { status: 500 }
        );
    }
}