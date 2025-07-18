import connectDB from "@/config/db";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import {v2 as cloudinary} from "cloudinary";
import { NextResponse } from "next/server";
import authSeller from "@/lib/authSeller";
import mongoose from "mongoose";

// configure cloudinary - trim env vars to remove any spaces
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

export async function POST(request) {
    try {
      const {userId}=getAuth(request)
      
      console.log("Processing product add request for user:", userId);
       
      const isSeller = await authSeller(userId);
      if (!isSeller) {
        console.log("Authorization failed: User is not a seller");
        return NextResponse.json({ success: false, message: "You are not authorized to add products" }, { status: 403 });
      }
        const formData = await request.formData();

        const name = formData.get("name");
        const description = formData.get("description");
        const category = formData.get("category");
        const price = formData.get("price");
        const offerPrice = formData.get("offerPrice");

        console.log("Product details:", { name, category, price, offerPrice });

        const files = formData.getAll("images");
        if (!files || files.length === 0) {
            console.log("No images found in request");
            return NextResponse.json({ success: false, message: "Please upload at least one image" }, { status: 400 });
        }

        // Filter out null files
        const validFiles = files.filter(file => file && file.size > 0);

        if (validFiles.length === 0) {
            console.log("No valid images found");
            return NextResponse.json({ success: false, message: "Please upload at least one valid image" }, { status: 400 });
        }

        console.log(`Processing ${validFiles.length} valid image files`);

        const result = await Promise.all(
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

        const images = result.map((res) => res.secure_url);
        console.log("Connecting to database");
        
        await connectDB();
        console.log("Database connected, creating product");
        
        const productData = {
            userId,
            name,
            description,
            category,
            price: Number(price),
            offerPrice: Number(offerPrice),
            images,
            date: Date.now(),
        };
        
        console.log("Creating new product with data:", productData);
        
        // Get current database and collection info
        console.log("Current database:", mongoose.connection.db.databaseName);
        
        // Use our enhanced createProduct method to ensure proper saving
        const savedProduct = await Product.createProduct(productData);
        console.log("Product created and verified with ID:", savedProduct._id);
        
        // Double verification - try to fetch the product directly from MongoDB
        const directCheck = await mongoose.connection.db.collection('products').findOne({ _id: savedProduct._id });
        console.log("Direct MongoDB verification result:", !!directCheck);

        if (!directCheck) {
            console.warn("Product was saved with Mongoose but could not be verified with direct MongoDB query");
        }

        return NextResponse.json({ 
            success: true, 
            message: "Product added successfully", 
            newProduct: savedProduct 
        }, { status: 201 });

    } catch (error) {
        console.error("Product add error details:", error);
        console.error("Error stack:", error.stack);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 }); 
    }
}
