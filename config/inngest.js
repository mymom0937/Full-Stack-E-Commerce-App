import { EventSchemas, Inngest } from "inngest";
import connectDB from "./db";
// Import the User model to interact with the database
import User from "@/models/User"; 
import mongoose from "mongoose";
import Order from "@/models/Order";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "ezcart-next" });

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
  { id: "create-user-order" }, // Remove batch processing for now
  { event: "order/created" },
  async ({ event, step }) => {
    try {
      console.log("Processing order event:", event.id);
      
      // Log the data to see what we're working with
      console.log("Order data received:", JSON.stringify(event.data));
      
      // Explicitly check if we have amount field with correct spelling
      if ('amount' in event.data) {
        console.log(`Order amount field found: ${event.data.amount}`);
      } else if ('ammount' in event.data) {
        console.log(`Warning: Found misspelled 'ammount' field: ${event.data.ammount}`);
        // Fix the misspelling by copying to correct field name
        event.data.amount = event.data.ammount;
      } else {
        console.log("Neither 'amount' nor 'ammount' field found in event data");
      }
      
      // Connect to database first
      await step.run("connect-to-db", async () => {
        await ensureEcommerceDB();
        console.log(`Connected to database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
        return { success: true };
      });
      
      // Create the order document
      const orderData = {
        userId: event.data.userId,
        items: event.data.items,
        amount: event.data.amount, // Ensure this is 'amount' not 'ammount'
        address: event.data.address,
        date: event.data.date,
        status: "Order Placed",
        paymentType: event.data.paymentType || "Stripe", // Include paymentType with default
        isPaid: event.data.isPaid !== undefined ? event.data.isPaid : false, // Include isPaid with default
        stripeSessionId: event.data.stripeSessionId // Store the Stripe session ID
      };
      
      console.log("Order data prepared:", JSON.stringify(orderData));
      
      // Try a direct MongoDB insert to bypass Mongoose schema validation
      return await step.run("save-order-direct", async () => {
        try {
          await ensureEcommerceDB();
          
          // Double check the orderData has the correct field name
          if ('ammount' in orderData && !('amount' in orderData)) {
            console.log("Fixing field name from 'ammount' to 'amount' before insertion");
            orderData.amount = orderData.ammount;
            delete orderData.ammount;
          }
          
          // Try direct insertion to bypass Mongoose validation
          const result = await mongoose.connection.db.collection('orders').insertOne(orderData);
          
          console.log("Order created directly in MongoDB:", result.insertedId);
          return { success: true, orderId: result.insertedId.toString() };
        } catch (dbError) {
          console.error("Database error creating order:", dbError);
          
          // Fallback to Mongoose if direct insert fails
          try {
            console.log("Trying Mongoose fallback...");
            const order = new Order(orderData);
            const savedOrder = await order.save();
            console.log("Order created via Mongoose:", savedOrder._id);
            return { success: true, orderId: savedOrder._id };
          } catch (mongooseError) {
            console.error("Mongoose error:", mongooseError);
            throw new Error(`Failed to save order: ${mongooseError.message}`);
          }
        }
      });
    } catch (error) {
      console.error("Error in order creation function:", error);
      return { success: false, error: error.message };
    }
  }
)