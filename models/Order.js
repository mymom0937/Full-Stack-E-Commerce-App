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
    },
    paymentType: {type:String, required:true},
    isPaid : {type:Boolean, required: true, default:false}
  },
  {
    timestamps: true // Add createdAt and updatedAt timestamps
  }
);

// Create a compound index for faster queries
orderSchema.index({ userId: 1, date: -1 });

// Get current database name if connected
const currentDb = mongoose.connection.db ? mongoose.connection.db.databaseName : null;
console.log(`Current database when initializing Order model: ${currentDb || 'not connected yet'}`);

let Order;

// Handle different database connection scenarios
if (mongoose.connection.readyState === 1) {
  // If we're connected but not to ecommerce, switch to it
  if (currentDb && currentDb !== 'ecommerce') {
    console.log(`Switching from ${currentDb} to ecommerce database for Order model`);
    const ecommerceDb = mongoose.connection.useDb('ecommerce');
    Order = ecommerceDb.models.orders || ecommerceDb.model('orders', orderSchema);
  } else {
    // Normal case when connected to ecommerce already
    Order = mongoose.models.orders || mongoose.model('orders', orderSchema);
  }
} else {
  // Not connected yet, create model normally (connection will determine database)
  Order = mongoose.models.orders || mongoose.model('orders', orderSchema);
}

console.log(`Order model initialized with collection name: ${Order.collection.name}`);
console.log(`Order model database: ${mongoose.connection.db ? mongoose.connection.db.databaseName : 'not connected yet'}`);

export default Order;
