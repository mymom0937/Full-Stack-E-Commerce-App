import React, { useState } from "react";

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ message: "", type: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setStatus({ message: "Please enter a valid email address", type: "error" });
      return;
    }

    setIsSubmitting(true);
    // Simulate submission - in a real app, this would be an API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStatus({ message: "Thank you for subscribing!", type: "success" });
      setEmail("");
      // Reset success message after 3 seconds
      setTimeout(() => setStatus({ message: "", type: "" }), 3000);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 py-12 px-4 max-w-3xl mx-auto">
      <h2 className="md:text-3xl text-2xl font-medium text-text-primary">
        Stay Updated with Latest Offers
      </h2>
      <p className="md:text-base text-text-secondary max-w-xl">
        Subscribe to our newsletter and receive exclusive deals, early access to new products, and 20% off your first order.
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-between w-full max-w-xl mt-4">
        <div className="relative w-full">
          <input
            className="border border-border-color rounded-md h-12 outline-none w-full px-4 text-text-primary bg-background transition-colors duration-200 sm:rounded-r-none"
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email address"
            required
          />
          {status.message && (
            <p className={`text-sm absolute -bottom-6 left-0 ${status.type === "error" ? "text-red-500" : "text-green-500"}`}>
              {status.message}
            </p>
          )}
        </div>
        <button 
          className="mt-4 sm:mt-0 h-12 px-8 font-medium text-white bg-[#F8BD19] rounded-md sm:rounded-l-none hover:bg-[#e9b018] transition-colors duration-200 w-full sm:w-auto disabled:bg-[#F8BD19]/70"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
};

export default NewsLetter;
