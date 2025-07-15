import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    console.log("Starting product list request");
    
    await connectDB();
    console.log("Connected to database");
    
    // Check database and collection status
    console.log("Current database:", mongoose.connection.db.databaseName);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    // Check if products collection exists
    const hasProductsCollection = collections.some(c => c.name === 'products');
    console.log("Products collection exists:", hasProductsCollection);
    
    // Get products count using native driver
    const productsCount = await mongoose.connection.db.collection('products').countDocuments();
    console.log(`Products count in database: ${productsCount}`);
    
    // Fetch all products
    const products = await Product.find({});
    console.log(`Products found via Mongoose: ${products.length}`);
    
    // If counts don't match, log warning
    if (products.length !== productsCount) {
      console.warn(`Warning: Mongoose found ${products.length} products but native driver found ${productsCount}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      products,
      diagnostic: {
        dbName: mongoose.connection.db.databaseName,
        collectionsCount: collections.length,
        productsCount
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
