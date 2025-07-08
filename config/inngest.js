import { Inngest } from "inngest";
import connectDB from "./db";
// Import the User model to interact with the database
import User from "@/models/User"; 
import mongoose from "mongoose";
import Order from "@/models/Order";
export const inngest = new Inngest({ id: "quickcart-next" });

// Helper function to ensure we're using the ecommerce database
async function ensureEcommerceDB() {
  await connectDB();
  console.log(`Current database: ${mongoose.connection.db?.databaseName || 'not connected'}`);
  
  // If we're not on ecommerce database, switch to it
  if (mongoose.connection.db && mongoose.connection.db.databaseName !== 'ecommerce') {
    console.log(`Switching from ${mongoose.connection.db.databaseName} to ecommerce database`);
    mongoose.connection.useDb('ecommerce');
    console.log(`Now using database: ${mongoose.connection.db.databaseName}`);
  }
}

// Inggest function to save user data to the database
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  {
    event: "clerk/user.created"
  },
  async ({ event }) => {
    try {
      console.log("Syncing user from Clerk - Event received:", event);
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;
      console.log("User data extracted:", { id, first_name, last_name, email: email_addresses[0]?.email_address });
      
      // Save user data to the database
      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        name: first_name + ' ' + last_name,
        imageUrl: image_url,
      }
      console.log("User data prepared:", userData);
      
      // Ensure we're connected to the ecommerce database
      await ensureEcommerceDB();
      console.log("Connected to MongoDB");
      
      const result = await User.create(userData);
      console.log("User created in MongoDB:", result);
      console.log(`User created in database: ${mongoose.connection.db.databaseName}, collection: ${User.collection.name}`);
      
      return { success: true };
    } catch (error) {
      console.error("Error creating user:", error);
      return { success: false, error: error.message };
    }
  }
);


// Inggest function to update user data in the database
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },    
  {
    event: "clerk/user.updated"
  },
    async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    // Update user data in the database
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + ' ' + last_name,
      imageUrl: image_url,
    };
    
    // Ensure we're connected to the ecommerce database
    await ensureEcommerceDB();
    
    await User.findByIdAndUpdate(id, userData);
    console.log(`User updated in database: ${mongoose.connection.db.databaseName}`);
  }
);

// Inngest function to delete user data from the database
export const syncUserDeletion = inngest.createFunction({
    id: "delete-user-with-clerk"
    }, {
    event: "clerk/user.deleted"
    },
     async ({ event }) => {
    const { id } = event.data;
    // Delete user data from the database
    
    // Ensure we're connected to the ecommerce database
    await ensureEcommerceDB();
    
    await User.findByIdAndDelete(id);
    console.log(`User deleted from database: ${mongoose.connection.db.databaseName}`);
});

//  Inngest function to create user's order in the database
export const createUserOrder = inngest.createFunction(
  { id: "create-user-order",
    batchEvents:{
      maxSize: 25, // Adjust this based on your needs
      timeout: '5s' // Wait up to 5 seconds for events to batch
    }
   },
  {
    event: "order/created"
  },

  async ({ events }) => {

    const orders = events.map((event) => {
      return {
        userId: event.data.userId,
        items: event.data.items,
        amount: event.data.amount,
        address: event.data.address,
        date: event.data.date
      }
    });
    
    // Process the orders here
    await connectDB();
    await Order.insertMany(orders);
    return {success:true, processed:orders.length}

  }
)