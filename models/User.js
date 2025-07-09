import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    imageUrl: { type: String, required: true },
    cartItems: { type: Object, default: {} },
    wishlist: { type: [String], default: [] }, // Array of product IDs
  },
  { 
    minimize: false,
    collection: 'users' 
  }
);

// Force the model to be created in the ecommerce database
let User;

// Check if we are using the ecommerce database
const currentDb = mongoose.connection.db ? mongoose.connection.db.databaseName : null;
console.log(`Current database before User model creation: ${currentDb || 'not connected'}`);

if (mongoose.connection.readyState === 1) {
  // If we're connected but not to ecommerce, switch to it
  if (currentDb && currentDb !== 'ecommerce') {
    console.log(`Switching from ${currentDb} to ecommerce database for User model`);
    const ecommerceDb = mongoose.connection.useDb('ecommerce');
    User = ecommerceDb.models.user || ecommerceDb.model('user', userSchema);
  } else {
    // Normal case when connected to ecommerce already
    User = mongoose.models.user || mongoose.model('user', userSchema);
  }
} else {
  // Not connected yet, create model normally (connection will determine database)
  User = mongoose.models.user || mongoose.model('user', userSchema);
}

console.log(`User model initialized in database: ${mongoose.connection.db ? mongoose.connection.db.databaseName : 'not connected yet'}`);
console.log("User model collection:", User.collection.name);

export default User;