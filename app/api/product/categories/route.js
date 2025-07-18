import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    // Aggregate to get categories and their counts
    const categories = await Product.aggregate([
      // Group by category and count products
      { $group: { _id: "$category", count: { $sum: 1 } } },
      // Sort by count in descending order
      { $sort: { count: -1 } },
      // Rename _id to category
      { $project: { category: "$_id", count: 1, _id: 0 } }
    ]);

    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
} 