import { addressDummyData, assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';

// Simple UUID generation if uuid library is not available
const generateOrderId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Global variable to prevent multiple order submissions across renders
if (typeof window !== 'undefined') {
  window.__orderBeingPlaced = window.__orderBeingPlaced || false;
  window.__lastOrderTimestamp = window.__lastOrderTimestamp || 0;
  window.__orderCount = window.__orderCount || 0;
}

const OrderSummary = () => {
  const { currency, router, getCartCount, getCartAmount, getToken, user, cartItems, setCartItems } = useAppContext()
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingCOD, setLoadingCOD] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [disableAllButtons, setDisableAllButtons] = useState(false);
  const orderInProgress = useRef(false);
  const orderIdRef = useRef(generateOrderId());
  const buttonClickedOnce = useRef(false);
  const orderPlaced = useRef(false);
  
  // Track button click timestamps to prevent duplicate submissions
  const lastClickTime = useRef(0);
  
  // Check global flag on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Reset the global flag on component mount
      window.__orderBeingPlaced = false;
      setIsProcessingOrder(false);
      orderInProgress.current = false;
      buttonClickedOnce.current = false;
      
      // Reset order count when component mounts
      window.__orderCount = 0;
    }
  }, []);

  const [userAddresses, setUserAddresses] = useState([]);

  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const {data} = await axios.get("/api/user/get-address", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setUserAddresses(data.address);
        if (data.address.length > 0) {
          setSelectedAddress(data.address[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const handleAddressSelect = (address) => {
    if (isProcessingOrder || disableAllButtons) return; // Prevent changes during order processing
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault(); // Prevent default form submission
    
    if (disableAllButtons) {
      // console.log("All buttons disabled, preventing action");
      return;
    }
    
    // Reset global flag in case it was stuck
    if (typeof window !== 'undefined') {
      window.__orderBeingPlaced = false;
    }
    
    // Prevent rapid multiple clicks
    const now = Date.now();
    if (now - lastClickTime.current < 2000) {
      // console.log("Button clicked too soon after previous click");
      return;
    }
    lastClickTime.current = now;
    
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }
    
    let cartItemsArray = Object.keys(cartItems).map((key) => 
      ({ product: key, quantity: cartItems[key] }));
    cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);

    if (cartItemsArray.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    // Generate a new order ID for this session
    orderIdRef.current = generateOrderId();
    setShowPaymentOptions(true);
  };

  const createOrder = async (e) => {
    // Prevent the default form submission
    if (e) e.preventDefault();
    
    // IMMEDIATE disable all buttons to prevent double clicks
    setDisableAllButtons(true);
    
    // Check for duplicate order submission (using global timestamp)
    if (typeof window !== 'undefined') {
      const now = Date.now();
      if (window.__lastOrderTimestamp && now - window.__lastOrderTimestamp < 10000) {
        // console.log("Preventing duplicate order - too soon after last order");
        toast.error("An order was just placed. Please wait a moment.");
        setTimeout(() => setDisableAllButtons(false), 5000);
        return;
      }
      
      // Check if we've already processed an order in this session
      if (window.__orderCount > 0) {
        // console.log("Order already processed in this session");
        toast.error("An order has already been placed. Please refresh the page to place another order.");
        return;
      }
      
      // Increment order count
      window.__orderCount++;
    }
    
    // Prevent if already processing
    if (loadingCOD || loadingStripe || isProcessingOrder || buttonClickedOnce.current) {
      // console.log("Order already in progress, preventing duplicate");
      return;
    }
    
    // Reset state
    setLoadingCOD(true);
    setIsProcessingOrder(true);
    buttonClickedOnce.current = true;
    
    // Set global flag
    if (typeof window !== 'undefined') {
      window.__orderBeingPlaced = true;
      window.__lastOrderTimestamp = Date.now();
    }
    
    try {
      if (!selectedAddress) {
        toast.error("Please select an address");
        resetOrderState();
        return;
      }
      
      let cartItemsArray = Object.keys(cartItems).map((key) => 
        ({ product: key, quantity: cartItems[key] }));
      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        toast.error("Your cart is empty");
        resetOrderState();
        return;
      }
      
      // Add unique identifier to help prevent duplicate orders
      const orderRequestId = orderIdRef.current;
      
      // Clear cart immediately to prevent reordering if page is refreshed
      const cartBackup = {...cartItems};
      setCartItems({});
      
      // Disable all form elements to prevent user interaction
      document.querySelectorAll('button, input, select').forEach(element => {
        element.setAttribute('disabled', 'disabled');
      });
      
      const token = await getToken();
      const { data } = await axios.post("/api/order/create", 
        {
          address: selectedAddress._id,
          items: cartItemsArray,
          orderRequestId,
          clientTimestamp: Date.now()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (data.success) {
        toast.success(data.message);
        orderPlaced.current = true;
        
        // Navigate away immediately, don't wait for any further processing
        setTimeout(() => {
          window.location.href = '/order-placed';
        }, 1000);
      } else {
        // Restore cart if order failed
        setCartItems(cartBackup);
        toast.error(data.message || "Failed to create order");
        resetOrderState();
      }
    } catch (error) {
      // console.error("Order creation error:", error);
      toast.error(error.response?.data?.message || error.message || "Error creating order");
      resetOrderState();
    }
  }

  const createOrderStripe = async (e) => {
    // Prevent the default form submission
    if (e) e.preventDefault();
    
    // IMMEDIATE disable all buttons to prevent double clicks
    setDisableAllButtons(true);
    
    // Check for duplicate order submission (using global timestamp)
    if (typeof window !== 'undefined') {
      const now = Date.now();
      if (window.__lastOrderTimestamp && now - window.__lastOrderTimestamp < 10000) {
        // console.log("Preventing duplicate order - too soon after last order");
        toast.error("An order was just placed. Please wait a moment.");
        setTimeout(() => setDisableAllButtons(false), 5000);
        return;
      }
      
      // Check if we've already processed an order in this session
      if (window.__orderCount > 0) {
        // console.log("Order already processed in this session");
        toast.error("An order has already been placed. Please refresh the page to place another order.");
        return;
      }
      
      // Increment order count
      window.__orderCount++;
    }
    
    // Prevent if already processing
    if (loadingCOD || loadingStripe || isProcessingOrder || buttonClickedOnce.current) {
      // console.log("Order already in progress, preventing duplicate");
      return;
    }
    
    // Reset state
      setLoadingStripe(true);
    setIsProcessingOrder(true);
    buttonClickedOnce.current = true;
    
    // Set global flag
    if (typeof window !== 'undefined') {
      window.__orderBeingPlaced = true;
      window.__lastOrderTimestamp = Date.now();
    }
    
    try {
      if (!selectedAddress) {
        toast.error("Please select an address");
        resetOrderState();
        return;
      }
      
      let cartItemsArray = Object.keys(cartItems).map((key) => ({
        product: key,
        quantity: cartItems[key],
      }));
      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        toast.error("Your cart is empty");
        resetOrderState();
        return;
      }
      
      // Add unique identifier to help prevent duplicate orders
      const orderRequestId = orderIdRef.current;
      
      // Clear cart immediately to prevent reordering if page is refreshed
      const cartBackup = {...cartItems};
      setCartItems({});
      
      // Disable all form elements to prevent user interaction
      document.querySelectorAll('button, input, select').forEach(element => {
        element.setAttribute('disabled', 'disabled');
      });
      
      const token = await getToken();
      const { data } = await axios.post(
        "/api/order/stripe",
        {
          address: selectedAddress._id,
          items: cartItemsArray,
          orderRequestId,
          clientTimestamp: Date.now()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (data.success) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        // Restore cart if order failed
        setCartItems(cartBackup);
        toast.error(data.message || "Failed to create order");
        resetOrderState();
      }
    } catch (error) {
      // console.error("Stripe order error:", error);
      toast.error(error.response?.data?.message || error.message || "Error creating order");
      resetOrderState();
    }
  };

  // Helper function to reset all order state when there's an error
  const resetOrderState = () => {
    setLoadingCOD(false);
      setLoadingStripe(false);
    setIsProcessingOrder(false);
    buttonClickedOnce.current = false;
    orderInProgress.current = false;
    
    // Allow buttons to be clickable again after a delay
    setTimeout(() => {
      setDisableAllButtons(false);
    }, 5000);
    
    if (typeof window !== 'undefined') {
      window.__orderBeingPlaced = false;
      window.__orderCount--; // Decrement the order count if there was an error
      if (window.__orderCount < 0) window.__orderCount = 0;
    }
  };  

  useEffect(() => {
    if(user){
      fetchUserAddresses();
    }
    
    // Reset button click state when component mounts
    buttonClickedOnce.current = false;
    orderInProgress.current = false;
    lastClickTime.current = 0;
    setDisableAllButtons(false);
    
    // Generate a new order ID
    orderIdRef.current = generateOrderId();
    
    // Clean up function
    return () => {
      buttonClickedOnce.current = false;
      orderInProgress.current = false;
      if (typeof window !== 'undefined') {
        window.__orderBeingPlaced = false;
      }
    };
  }, [user]);

  // Effect to navigate away if order was placed
  useEffect(() => {
    if (orderPlaced.current) {
      const timer = setTimeout(() => {
        router.push('/order-placed');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [orderPlaced.current, router]);

  return (
    <div className="w-full md:w-96 bg-card-bg p-5">
      <h2 className="text-xl md:text-2xl font-medium text-text-primary">
        Order Summary
      </h2>
      <hr className="border-border-color my-5" />
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-text-secondary block mb-2">
            Select Address
          </label>
          <div className="relative inline-block w-full text-sm border border-border-color">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-background text-text-primary focus:outline-none"
              onClick={() => !isProcessingOrder && !disableAllButtons && setIsDropdownOpen(!isDropdownOpen)}
              disabled={isProcessingOrder || disableAllButtons}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Address"}
              </span>
              <svg
                className={`w-5 h-5 inline float-right transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && !isProcessingOrder && !disableAllButtons && (
              <ul className="absolute w-full bg-background border border-border-color shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-card-bg cursor-pointer text-text-primary"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullName}, {address.area}, {address.city},{" "}
                    {address.state}
                  </li>
                ))}
                <li
                  onClick={() => !isProcessingOrder && !disableAllButtons && router.push("/add-address")}
                  className="px-4 py-2 hover:bg-card-bg cursor-pointer text-center text-text-primary"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>

        <div>
          <label className="text-base font-medium uppercase text-text-secondary block mb-2">
            Promo Code
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow w-full outline-none p-2.5 text-text-primary bg-background border border-border-color"
              disabled={isProcessingOrder || disableAllButtons}
            />
            <button 
              className="bg-[#F8BD19] text-white px-9 py-2 hover:bg-[#F8BD19]/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isProcessingOrder || disableAllButtons}
            >
              Apply
            </button>
          </div>
        </div>

        <hr className="border-border-color my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-text-secondary">
              Items {getCartCount()}
            </p>
            <p className="text-text-primary">
              {currency}
              {getCartAmount()}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-text-secondary">Shipping Fee</p>
            <p className="font-medium text-text-primary">Free</p>
          </div>
          <div className="flex justify-between">
            <p className="text-text-secondary">Tax (2%)</p>
            <p className="font-medium text-text-primary">
              {currency}
              {Math.floor(getCartAmount() * 0.02)}
            </p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t border-border-color pt-3">
            <p className="text-text-primary">Total</p>
            <p className="text-text-primary">
              {currency}
              {getCartAmount() + Math.floor(getCartAmount() * 0.02)}
            </p>
          </div>
        </div>
      </div>
      
      {showPaymentOptions ? (
        <div className="flex gap-2">
          <button
            onClick={createOrder}
            disabled={loadingCOD || loadingStripe || isProcessingOrder || disableAllButtons}
            className="w-1/2 bg-[#F8BD19] text-white py-2 mt-5 hover:bg-[#F8BD19]/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loadingCOD ? "Processing..." : "Cash on Delivery"}
          </button>

          <button
            onClick={createOrderStripe}
            disabled={loadingCOD || loadingStripe || isProcessingOrder || disableAllButtons}
            className="w-1/2 flex justify-center items-center border border-indigo-500 bg-white hover:bg-gray-100 py-2 mt-5 disabled:bg-gray-100 disabled:border-gray-300 disabled:cursor-not-allowed"
          >
            {loadingStripe ? (
              <span className="text-indigo-600">Processing...</span>
            ) : (
              <Image className="w-12" src={assets.stripe_logo} alt="logo"/>
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessingOrder || disableAllButtons}
          className="w-full bg-[#F8BD19] text-white py-3 mt-5 hover:bg-[#F8BD19]/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessingOrder ? "Processing..." : "Place Order"}
        </button>
      )}
      
      {isProcessingOrder && (
        <div className="text-center mt-4 text-amber-500 font-medium">
          Processing order, please wait...
        </div>
      )}
    </div>
  );
};

export default OrderSummary;