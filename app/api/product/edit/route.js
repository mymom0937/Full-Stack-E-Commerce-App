import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {v2 as cloudinary} from "cloudinary";

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

// Handle getting a specific product for editing
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    
    // Check if user is a seller
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to edit products" },
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
    
    // Find the product
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
        { success: false, message: "You can only edit your own products" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: true, product },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching product for edit:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Handle updating the product
export async function PUT(request) {
  try {
    const { userId } = getAuth(request);
    
    // Check if user is a seller
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to edit products" },
        { status: 403 }
      );
    }
    
    const formData = await request.formData();
    
    const productId = formData.get("productId");
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const existingImages = formData.get("existingImages"); // JSON string of existing images to keep
    
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
        { success: false, message: "You can only edit your own products" },
        { status: 403 }
      );
    }
    
    // Handle images
    let imagesToSave = [];
    
    // Parse existing images if provided
    if (existingImages) {
      try {
        imagesToSave = JSON.parse(existingImages);
      } catch (err) {
        console.error("Error parsing existing images:", err);
      }
    }
    
    // Handle new image uploads
    const files = formData.getAll("newImages");
    const validFiles = files.filter(file => file && file.size > 0);
    
    if (validFiles.length > 0) {
      const uploadResults = await Promise.all(
        validFiles.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: "auto",
                folder: "ecommerce_products",
                use_filename: true,
                unique_filename: true,
                overwrite: true
              },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary upload error:", error);
                  reject(error);
                } else {
                  console.log("Image uploaded successfully:", result.secure_url);
                  resolve(result);
                }
              }
            );
            stream.end(buffer);
          });
        })
      );
      
      // Add new image URLs to the array
      const newImageUrls = uploadResults.map((res) => res.secure_url);
      imagesToSave = [...imagesToSave, ...newImageUrls];
    }
    
    // Ensure at least one image
    if (imagesToSave.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one image is required" },
        { status: 400 }
      );
    }
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        category,
        price: Number(price),
        offerPrice: Number(offerPrice),
        images: imagesToSave
      },
      { new: true } // Return the updated document
    );
    
    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error updating product:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 