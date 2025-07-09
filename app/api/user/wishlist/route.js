import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Get user's wishlist
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
        const user = await User.findById(userId);
        
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            success: true, 
            wishlist: user.wishlist || [] 
        });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch wishlist" },
            { status: 500 }
        );
    }
}

// Update wishlist (add or remove item)
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { productId, action } = await request.json();
        
        if (!productId || !action || !['add', 'remove', 'toggle'].includes(action)) {
            return NextResponse.json(
                { success: false, message: "Invalid request. Provide productId and action (add, remove, or toggle)" },
                { status: 400 }
            );
        }

        await connectDB();
        const user = await User.findById(userId);
        
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Initialize wishlist if it doesn't exist
        if (!user.wishlist) {
            user.wishlist = [];
        }

        let message = '';
        let isInWishlist = user.wishlist.includes(productId);
        
        if (action === 'add' && !isInWishlist) {
            user.wishlist.push(productId);
            message = 'Product added to wishlist';
            isInWishlist = true;
        } else if (action === 'remove' && isInWishlist) {
            user.wishlist = user.wishlist.filter(id => id !== productId);
            message = 'Product removed from wishlist';
            isInWishlist = false;
        } else if (action === 'toggle') {
            if (isInWishlist) {
                user.wishlist = user.wishlist.filter(id => id !== productId);
                message = 'Product removed from wishlist';
                isInWishlist = false;
            } else {
                user.wishlist.push(productId);
                message = 'Product added to wishlist';
                isInWishlist = true;
            }
        } else {
            message = isInWishlist ? 'Product already in wishlist' : 'Product not in wishlist';
        }

        await user.save();

        return NextResponse.json({ 
            success: true, 
            message,
            isInWishlist,
            wishlist: user.wishlist 
        });
    } catch (error) {
        console.error("Error updating wishlist:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to update wishlist" },
            { status: 500 }
        );
    }
} 