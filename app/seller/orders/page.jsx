"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import axios from "axios";
import * as Toast from "@/lib/toast";

const Orders = () => {
  const { currency, getToken, user, products, router } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processedOrders, setProcessedOrders] = useState([]);

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get("/api/order/seller-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setOrders(data.orders);
      } else {
        Toast.showError(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      Toast.handleApiError(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Process orders to resolve product references and handle potential undefined values
  useEffect(() => {
    if (orders.length > 0 && products.length > 0) {
      const processed = orders.map(order => {
        // Process items to resolve product references
        const items = Array.isArray(order.items) ? order.items.map(item => {
          let productData = products.find(p => p && p._id === item.product);
          
          // If product not found in context, use fallback
          if (!productData) {
            productData = { 
              name: item.productName || "Product", 
              _id: item.product,
              images: []
            };
          }
          
          return {
            ...item,
            product: productData,
            quantity: item.quantity || 1
          };
        }) : [];
        
        // Process address - convert from string reference to object if needed
        let addressData = order.address;
        if (typeof addressData === 'string' && order.addressDetails) {
          addressData = order.addressDetails;
        } else if (typeof addressData === 'string') {
          // Fallback for address
          addressData = {
            fullName: "Customer",
            area: "Address area",
            city: "City",
            state: "State",
            phoneNumber: "Phone number"
          };
        }
        
        return {
          ...order,
          items,
          address: addressData,
          status: order.status || "Pending"
        };
      });
      
      setProcessedOrders(processed);
    }
  }, [orders, products]);

  useEffect(() => {
    if (user) {
      fetchSellerOrders();
    }
  }, [user]);

  // Format the items list for display
  const formatItems = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return "No items";
    }
    
    return items.map(item => {
      const name = item.product?.name || 'Product';
      const quantity = item.quantity || 1;
      return `${name} × ${quantity}`;
    }).join(', ');
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "No address";
    
    if (typeof address === 'object') {
      return (
        <>
          <span className="font-medium">{address.fullName || 'Customer'}</span>
          <br />
          <span>{address.area || ''}</span>
          <br />
          <span>{`${address.city || ''}, ${address.state || ''}`}</span>
          <br />
          <span>{address.phoneNumber || ''}</span>
        </>
      );
    }
    
    return String(address);
  };

  return (
    <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
      {loading ? (
        <Loading />
      ) : (
        <div className="md:p-10 p-4 space-y-5">
          <h2 className="text-lg font-medium">Orders</h2>
          
          {processedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
              <div className="mb-6">
                <Image 
                  src={assets.box_icon} 
                  alt="No orders" 
                  width={80} 
                  height={80}
                  className="opacity-30"
                />
              </div>
              <p className="text-xl text-gray-500 mb-4">No orders found</p>
              <p className="text-gray-400 mb-6 text-center max-w-md">You don't have any orders yet.</p>
            </div>
          ) : (
          <div className="max-w-4xl rounded-md">
              {processedOrders.map((order, index) => (
              <div
                  key={order._id || index}
                className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300"
              >
                <div className="flex-1 flex gap-5 max-w-80">
                  <Image
                    className="max-w-16 max-h-16 object-cover"
                    src={assets.box_icon}
                    alt="box_icon"
                  />
                  <p className="flex flex-col gap-3">
                    <span className="font-medium">
                        {formatItems(order.items)}
                    </span>
                      <span>Items: {(order.items || []).length}</span>
                  </p>
                </div>
                <div>
                  <p>
                      {formatAddress(order.address)}
                  </p>
                </div>
                <div className="flex flex-col gap-1 items-end justify-center">
                  <div className="text-sm flex items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Amount:</span>
                    <span className="ml-1 text-gray-900 dark:text-white font-medium text-lg">
                      {currency.symbol}
                    {order.amount || 0}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 min-w-[160px]">
                  <div className="text-sm flex items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Payment Method:</span>
                    <span className="ml-1">
                      {order.paymentType === "Stripe" ? (
                        <span className="inline-flex items-center">
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">Stripe</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-1 text-indigo-600 dark:text-indigo-400">
                            <path d="M2.273 5.625A4.483 4.483 0 0 1 5.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 3H5.25a3 3 0 0 0-2.977 2.625ZM2.273 8.625A4.483 4.483 0 0 1 5.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 6H5.25a3 3 0 0 0-2.977 2.625ZM5.25 9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H15a.75.75 0 0 0-.75.75 2.25 2.25 0 0 1-4.5 0A.75.75 0 0 0 9 9H5.25Z" />
                          </svg>
                        </span>
                      ) : order.paymentType === "COD" ? (
                        <span className="inline-flex items-center">
                          <span className="text-green-600 dark:text-green-400 font-medium">Cash on Delivery</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-1 text-green-600 dark:text-green-400">
                            <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                            <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875h-17.25c-1.036 0-1.875-.84-1.875-1.875v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z" clipRule="evenodd" />
                            <path d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 0 0-.75-.75H2.25Z" />
                          </svg>
                        </span>
                      ) : (
                        <span className="text-gray-800 dark:text-gray-200">{order.paymentType || "COD"}</span>
                      )}
                    </span>
                  </div>
                  
                  <div className="text-sm flex items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                    <span className="ml-1 text-gray-800 dark:text-gray-200">
                      {order.date ? new Date(order.date).toLocaleDateString() : 'Unknown date'}
                    </span>
                  </div>
                  
                  <div className="text-sm flex items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Payment:</span>
                    {order.isPaid ? (
                      <span className="ml-1 inline-flex items-center text-green-600 dark:text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                        </svg>
                        Paid
                      </span>
                    ) : (
                      <span className="ml-1 inline-flex items-center text-amber-600 dark:text-amber-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                        </svg>
                        Pending
                      </span>
                    )}
                  </div>
                  
                  <button
                    className="mt-2 text-sm text-orange-500 hover:text-orange-600 hover:underline flex items-center"
                    onClick={() => router.push(`/order-details/${order._id}`)}
                  >
                    <span>View Details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
