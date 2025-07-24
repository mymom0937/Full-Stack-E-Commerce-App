import mongoose from "mongoose";

// Define product schema
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
    type: Number,
    required: true
  }
}, {
  collection: 'products', // Explicitly set the collection name
  strict: true,
  writeConcern: {
    w: 'majority',
    j: true
  }
});

// Make sure we're using the right model and database
const getProductModel = () => {
  // Get current database name
  const currentDb = mongoose.connection.db ? mongoose.connection.db.databaseName : null;
  // console.log(`Current database before Product model creation: ${currentDb || 'not connected'}`);
  
  // Check if we're connected
  if (mongoose.connection.readyState === 1) {
    // If connected but not to ecommerce database, switch to it
    if (currentDb && currentDb !== 'ecommerce') {
      console.log(`Switching from ${currentDb} to ecommerce database for Product model`);
      const ecommerceDb = mongoose.connection.useDb('ecommerce');
      
      // Return existing model or create new one
      if (ecommerceDb.models.products) {
        // console.log("Using existing Product model from ecommerce database");
        return ecommerceDb.models.products;
      } else {
        // console.log("Creating new Product model in ecommerce database");
        return ecommerceDb.model('products', productSchema);
      }
    } else {
      // We're already connected to ecommerce database
      // Return existing model or create new one
      if (mongoose.models.products) {
        // console.log("Using existing Product model from mongoose models");
        return mongoose.models.products;
      } else {
        // console.log("Creating new Product model in mongoose");
        return mongoose.model('products', productSchema);
      }
    }
  } else {
    // Not connected yet, create model for when connection is established
    // console.log("Creating Product model before connection");
    return mongoose.models.products || mongoose.model('products', productSchema);
  }
};

// Get the model
const Product = getProductModel();
// console.log(`Product model initialized in database: ${mongoose.connection.db ? mongoose.connection.db.databaseName : 'not connected yet'}`);
// console.log("Product model collection:", Product.collection.name);

// Add a custom method to ensure we're saving to the right database
Product.createProduct = async function(productData) {
  try {
    // Verify we're connected to ecommerce database
    if (mongoose.connection.db && mongoose.connection.db.databaseName !== 'ecommerce') {
      console.log(`Switching to ecommerce database before creating product`);
      mongoose.connection.useDb('ecommerce');
    }
    
    // Create and save product
    const product = new Product(productData);
    const savedProduct = await product.save();
    console.log(`Product saved successfully with ID: ${savedProduct._id}`);
    
    // Verify the product was saved
    const verifiedProduct = await Product.findById(savedProduct._id);
    if (!verifiedProduct) {
      throw new Error("Product was not saved correctly");
    }
    
    return savedProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export default Product;