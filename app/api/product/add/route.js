import connectDB from "@/config/db";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import {v2 as cloudinary} from "cloudinary";
import { NextResponse } from "next/server";
import authSeller from "@/lib/authSeller";

// configure cloudinary - trim env vars to remove any spaces
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

export async function POST(request) {
    try {
      const {userId}=getAuth(request)
       
      const isSeller = await authSeller(userId);
      if (!isSeller) {
        return NextResponse.json({ success: false, message: "You are not authorized to add products" }, { status: 403 });
      }
        const formData = await request.formData();

        const name = formData.get("name");
        const description = formData.get("description");
        const category = formData.get("category");
        const price = formData.get("price");
        const offerPrice = formData.get("offerPrice");

        const files = formData.getAll("images");
        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, message: "Please upload at least one image" }, { status: 400 });
        }

        // Filter out null files
        const validFiles = files.filter(file => file && file.size > 0);

        if (validFiles.length === 0) {
            return NextResponse.json({ success: false, message: "Please upload at least one valid image" }, { status: 400 });
        }

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
                                resolve(result);
                            }
                        }
                    );
                    stream.end(buffer);
                });
            })
        );

        const images = result.map((res) => res.secure_url);
        await connectDB();
        const newProduct = await Product.create({
            userId,
            name,
            description,
            category,
            price: Number(price),
            offerPrice: Number(offerPrice),
            images,
            date: Date.now(),
        });

        return NextResponse.json({ success: true, message: "Product added successfully", newProduct }, { status: 201 });

    } catch (error) {
        console.error("Product add error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 }); 
    }
}
