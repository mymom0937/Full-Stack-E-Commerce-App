import mongoose from "mongoose";

// Define the item schema separately for better validation
const orderItemSchema = new mongoose.Schema({
  product: { 
    type: String, 
    required: [true, 'Product ID is required'],
    ref: 'product'
  },
  quantity: { 
    type: Number, 
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'] 
  }
});

const orderSchema = new mongoose.Schema(
  {
    userId: { 
      type: String, 
      required: [true, 'User ID is required'],
      ref: "user" 
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order items are required'],
      validate: {
        validator: function(items) {
          return items && items.length > 0;
        },
        message: 'Order must contain at least one item'
      }
    },
    amount: { 
      type: Number, 
      required: [true, 'Order amount is required'],
      min: [0, 'Amount cannot be negative'] 
    },
    address: { 
      type: String, 
      required: [true, 'Shipping address is required'],
      ref: "address" 
    },
    status: { 
      type: String, 
      required: true, 
      default: "Order Placed",
      enum: ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] 
    },
    date: { 
      type: Number, 
      required: [true, 'Order date is required']
    }
  },
  {
    timestamps: true // Add createdAt and updatedAt timestamps
  }
);

// Create a compound index for faster queries
orderSchema.index({ userId: 1, date: -1 });

// If the model exists, reuse it; otherwise create a new one
const Order = mongoose.models.order || mongoose.model("order", orderSchema);

export default Order;
