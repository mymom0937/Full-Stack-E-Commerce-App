import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    const productId = params.id;
    
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log(`Fetching product with ID: ${productId}`);
    
    const product = await Product.findById(productId);
    
    if (!product) {
      console.log(`Product not found with ID: ${productId}`);
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    console.log(`Successfully found product: ${product.name}`);
    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 