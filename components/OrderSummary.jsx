import { addressDummyData, assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const OrderSummary = () => {

  const { currency, router, getCartCount, getCartAmount, getToken, user, cartItems, setCartItems } = useAppContext()
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingCOD, setLoadingCOD] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

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
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const handlePlaceOrder = () => {
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
    
    setShowPaymentOptions(true);
  };

  const createOrder = async () => {
    try {
      setLoadingCOD(true);
      if (!selectedAddress) {
        toast.error("Please select an address");
        setLoadingCOD(false);
        return;
      }
      
      let cartItemsArray = Object.keys(cartItems).map((key) => 
        ({ product: key, quantity: cartItems[key] }));
      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        toast.error("Your cart is empty");
        setLoadingCOD(false);
        return;
      }
      
      const token = await getToken();
      const { data } = await axios.post("/api/order/create", 
        {
          address: selectedAddress._id,
          items: cartItemsArray,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (data.success) {
        toast.success(data.message);
        setCartItems({});
        router.push('/order-placed');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingCOD(false);
    }
  }


  const createOrderStripe = async () => {
    try {
      setLoadingStripe(true);
      if (!selectedAddress) {
        toast.error("Please select an address");
        setLoadingStripe(false);
        return;
      }
      
      let cartItemsArray = Object.keys(cartItems).map((key) => ({
        product: key,
        quantity: cartItems[key],
      }));
      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        toast.error("Your cart is empty");
        setLoadingStripe(false);
        return;
      }
      
      const token = await getToken();
      const { data } = await axios.post(
        "/api/order/stripe",
        {
          address: selectedAddress._id,
          items: cartItemsArray,
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
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingStripe(false);
    }
  };  

  useEffect(() => {
    if(user){
      fetchUserAddresses();
    }
  }, [user]);

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
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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

            {isDropdownOpen && (
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
                  onClick={() => router.push("/add-address")}
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
            />
            <button className="bg-[#F8BD19] text-white px-9 py-2 hover:bg-[#F8BD19]/90">
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
            disabled={loadingCOD || loadingStripe}
            className="w-1/2 bg-[#F8BD19] text-white py-2 mt-5 hover:bg-[#F8BD19]/90 disabled:bg-gray-400"
          >
            {loadingCOD ? "Processing..." : "Cash on Delivery"}
          </button>

          <button
            onClick={createOrderStripe}
            disabled={loadingCOD || loadingStripe}
            className="w-1/2 flex justify-center items-center border border-indigo-500 bg-white hover:bg-gray-100 py-2 mt-5 disabled:bg-gray-100 disabled:border-gray-300"
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
          className="w-full bg-[#F8BD19] text-white py-3 mt-5 hover:bg-[#F8BD19]/90"
        >
          Place Order
        </button>
      )}
    </div>
  );
};

export default OrderSummary;