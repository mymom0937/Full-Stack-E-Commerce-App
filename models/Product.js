import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: "user",
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  offerPrice: {
    type: Number,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  images: {
    type: [String],
    required: true,
  },

 date:{
    type:Number,
    required: true
 }
}, {
  collection: 'products', // Explicitly set the collection name
  strict: true
});

// Force the model to be created in the ecommerce database
let Product;

// Check if we are using the ecommerce database
const currentDb = mongoose.connection.db ? mongoose.connection.db.databaseName : null;
console.log(`Current database before Product model creation: ${currentDb || 'not connected'}`);

if (mongoose.connection.readyState === 1) {
  // If we're connected but not to ecommerce, switch to it
  if (currentDb && currentDb !== 'ecommerce') {
    console.log(`Switching from ${currentDb} to ecommerce database for Product model`);
    const ecommerceDb = mongoose.connection.useDb('ecommerce');
    Product = ecommerceDb.models.products || ecommerceDb.model('products', productSchema);
  } else {
    // Normal case when connected to ecommerce already
    Product = mongoose.models.products || mongoose.model('products', productSchema);
  }
} else {
  // Not connected yet, create model normally (connection will determine database)
  Product = mongoose.models.products || mongoose.model('products', productSchema);
}

console.log(`Product model initialized in database: ${mongoose.connection.db ? mongoose.connection.db.databaseName : 'not connected yet'}`);
console.log("Product model collection:", Product.collection.name);

export default Product;