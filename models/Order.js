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

// Pre-save middleware to generate a unique orderHash
function generateOrderHash(userId, address, items) {
  // Create a string representation of the items sorted by product ID
  const sortedItems = [...items].sort((a, b) => {
    if (a.product < b.product) return -1;
    if (a.product > b.product) return 1;
    return 0;
  });
  
  const itemsString = sortedItems.map(item => `${item.product}:${item.quantity}`).join(',');
  return `${userId}:${address}:${itemsString}`;
}

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
    isPaid : {type:Boolean, required: true, default:false},
    // Add orderRequestId field to track unique request IDs from the client
    orderRequestId: {
      type: String,
      index: true, // Index this field for faster lookups
      sparse: true // Only index documents that have this field
    },
    // Add clientTimestamp field to help prevent duplicate orders
    clientTimestamp: {
      type: Number,
      index: true, // Index for faster lookups
      sparse: true // Only index documents that have this field
    },
    // Add a hash of the order details to detect duplicates
    orderHash: {
      type: String,
      index: true,
      sparse: true
    }
  },
  {
    timestamps: true // Add createdAt and updatedAt timestamps
  }
);

// Create a compound index for faster queries
orderSchema.index({ userId: 1, date: -1 });

// Add a unique index on orderRequestId to prevent duplicate orders
orderSchema.index({ orderRequestId: 1 }, { 
  unique: true, 
  sparse: true,  // Only apply uniqueness to documents that have this field
  partialFilterExpression: { orderRequestId: { $exists: true } } // Only apply to docs with this field
});

// Add a compound index on userId and clientTimestamp to prevent duplicate orders
orderSchema.index({ userId: 1, clientTimestamp: 1 }, {
  unique: true,
  sparse: true,
  partialFilterExpression: { clientTimestamp: { $exists: true } }
});

// Add a unique index on orderHash to prevent duplicate orders
orderSchema.index({ orderHash: 1 }, {
  unique: true,
  sparse: true,
  partialFilterExpression: { orderHash: { $exists: true } }
});

// Pre-save middleware to generate orderHash
orderSchema.pre('save', function(next) {
  if (!this.orderHash && this.userId && this.address && this.items) {
    this.orderHash = generateOrderHash(this.userId, this.address, this.items);
  }
  next();
});

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
