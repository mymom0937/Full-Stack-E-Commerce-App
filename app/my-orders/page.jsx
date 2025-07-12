"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import Breadcrumb from "@/components/Breadcrumb";
import axios from "axios";
import * as Toast from "@/lib/toast";
import OptimizedImage from "@/components/OptimizedImage";

const MyOrders = () => {
  const { currency, getToken, user, router, products } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processedOrders, setProcessedOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get("/api/order/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setOrders(data.orders.reverse());
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
      fetchOrders();
    }
  }, [user]);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };
  
  const formatOrderItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) return "No items";
    
    return items.map(item => {
      const productName = item.product?.name || "Product";
      return `${productName} × ${item.quantity}`;
    }).join(", ");
  };
  
  // Get shipping address as formatted text
  const formatAddress = (address) => {
    if (!address) return "No address";
    
    if (typeof address === 'object') {
      const parts = [];
      if (address.fullName) parts.push(address.fullName);
      if (address.area) parts.push(address.area);
      if (address.city || address.state) {
        parts.push(`${address.city || ''}, ${address.state || ''}`);
      }
      if (address.phoneNumber) parts.push(address.phoneNumber);
      return parts.filter(Boolean).join(" | ");
    }
    
    return String(address);
  };

  // Add this function to handle updating payment status
  const updatePaymentStatus = async (orderId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post("/api/order/update-payment", 
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        Toast.showSuccess("Payment status updated successfully");
        // Refresh the orders
        fetchOrders();
      } else {
        Toast.showError(data.message || "Failed to update payment status");
      }
    } catch (error) {
      Toast.handleApiError(error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-[calc(100vh-300px)]">
        <div className="space-y-5 max-w-5xl mx-auto w-full">
          {/* Breadcrumb */}
          <Breadcrumb currentPage="My Orders" />

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-medium">My Orders</h2>
          </div>

          {loading ? (
            <Loading />
          ) : processedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-card-bg rounded-lg border border-border-color">
              <div className="mb-6">
                <Image
                  src={assets.order_icon}
                  alt="Empty orders"
                  width={80}
                  height={80}
                  className="opacity-30"
                />
              </div>
              <p className="text-xl text-text-secondary mb-4">
                No orders found
              </p>
              <p className="text-text-secondary mb-6 text-center max-w-md">
                You haven't placed any orders yet.
              </p>
              <button
                onClick={() => router.push("/all-products")}
                className="px-6 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="w-full border border-border-color rounded-lg shadow-sm">
              {processedOrders.map((order, index) => (
                <div
                  key={order._id || index}
                  className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-border-color hover:border hover:border-orange-500 hover:rounded-md transition-all duration-200"
                >
                  <div className="flex-1 flex gap-5">
                    <div className="flex flex-wrap gap-2">
                      {(order.items || []).slice(0, 3).map((item, i) => (
                        <div
                          key={i}
                          className="relative w-16 h-16 rounded-md overflow-hidden border border-border-color"
                        >
                          <OptimizedImage
                            src={
                              item.product?.images?.[0] ||
                              item.product?.image?.[0] ||
                              "/placeholder-image.png"
                            }
                            alt={item.product?.name || "Product"}
                            width={64}
                            height={64}
                            className="w-16 h-16"
                          />
                          {item.quantity > 1 && (
                            <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs px-1 rounded-bl">
                              x{item.quantity}
                            </div>
                          )}
                        </div>
                      ))}
                      {(order.items || []).length > 3 && (
                        <div className="flex items-center justify-center w-16 h-16 rounded-md bg-card-bg text-text-secondary text-sm">
                          +{(order.items || []).length - 3} more
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-base text-text-primary">
                        {formatOrderItems(order.items)}
                      </p>
                      <p className="text-sm text-text-secondary">
                        Order #{order._id?.substring(0, 8) || index}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {formatAddress(order.address)}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {order.date
                          ? new Date(order.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "Unknown date"}
                      </p>
                      <div className="mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end justify-center">
                    <div className="text-sm flex items-center">
                      <span className="font-medium text-text-secondary">Amount:</span>
                      <span className="ml-1 text-text-primary font-medium text-lg">
                        {currency.symbol}
                      {order.amount || 0}
                      </span>
                    </div>
                    <div className="text-sm text-text-secondary flex items-center justify-end">
                      <span className="font-medium">Payment Method:</span>
                      <span className="ml-1">
                        {order.paymentType === "Stripe" ? (
                          <span className="inline-flex items-center">
                            <span className="text-indigo-600 font-medium">Stripe</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-1 text-indigo-500">
                              <path d="M2.273 5.625A4.483 4.483 0 0 1 5.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 3H5.25a3 3 0 0 0-2.977 2.625ZM2.273 8.625A4.483 4.483 0 0 1 5.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 6H5.25a3 3 0 0 0-2.977 2.625ZM5.25 9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H15a.75.75 0 0 0-.75.75 2.25 2.25 0 0 1-4.5 0A.75.75 0 0 0 9 9H5.25Z" />
                            </svg>
                          </span>
                        ) : order.paymentType === "COD" ? (
                          <span className="inline-flex items-center">
                            <span className="text-green-600 font-medium">Cash on Delivery</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-1 text-green-500">
                              <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                              <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875h-17.25c-1.036 0-1.875-.84-1.875-1.875v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z" clipRule="evenodd" />
                              <path d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 0 0-.75-.75H2.25Z" />
                            </svg>
                          </span>
                        ) : (
                          order.paymentType || "COD"
                        )}
                      </span>
                    </div>

                    <div className="text-sm flex items-center justify-end">
                      <span className="font-medium text-text-secondary">Status:</span>
                      {order.isPaid ? (
                        <span className="ml-1 inline-flex items-center text-green-600">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                          </svg>
                          Paid
                        </span>
                      ) : (
                        <div className="ml-1 flex items-center">
                          <span className="text-amber-600 inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                            </svg>
                            Pending
                          </span>
                        <button
                          onClick={() => updatePaymentStatus(order._id)}
                          className="ml-2 text-xs text-blue-500 hover:text-blue-700 underline"
                        >
                          Mark as Paid
                        </button>
                        </div>
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
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
