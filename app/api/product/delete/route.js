import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function DELETE(request) {
  try {
    const { userId } = getAuth(request);
    
    // Check if user is a seller
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to delete products" },
        { status: 403 }
      );
    }
    
    // Get product ID from the request URL
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find the product to verify ownership
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    
    // Verify that the seller owns this product
    if (product.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "You can only delete your own products" },
        { status: 403 }
      );
    }
    
    // Delete the product
    await Product.findByIdAndDelete(productId);
    
    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 