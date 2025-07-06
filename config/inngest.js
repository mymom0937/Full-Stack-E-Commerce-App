import { Inngest } from "inngest";
import connectDB from "./db";
// Import the User model to interact with the database
import User from "@/models/User"; 
export const inngest = new Inngest({ id: "quickcart-next" });

// Inggest function to save user data to the database
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  {
    event: "clerk/user.created"
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    // Save user data to the database
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + ' ' + last_name,
      imageUrl: image_url,
    }
    await connectDB();
    await User.create(userData);
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
    await connectDB();
    await User.findByIdAndUpdate(id, userData);
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
    await connectDB();
    await User.findByIdAndDelete(id);
});
