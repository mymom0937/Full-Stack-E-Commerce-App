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
        <div className="space-y-5">
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
              <p className="text-xl text-text-secondary mb-4">No orders found</p>
              <p className="text-text-secondary mb-6 text-center max-w-md">You haven't placed any orders yet.</p>
              <button 
                onClick={() => router.push('/all-products')} 
                className="px-6 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="max-w-5xl border border-border-color rounded-lg shadow-sm">
              {processedOrders.map((order, index) => (
                <div
                  key={order._id || index}
                  className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-border-color hover:border hover:border-orange-500 hover:rounded-md transition-all duration-200"
                >
                  <div className="flex-1 flex gap-5">
                    <div className="flex flex-wrap gap-2">
                      {(order.items || []).slice(0, 3).map((item, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-border-color">
                          <OptimizedImage
                            src={item.product?.images?.[0] || item.product?.image?.[0] || '/placeholder-image.png'}
                            alt={item.product?.name || 'Product'}
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
                        {order.date ? new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Unknown date'}
                      </p>
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 items-end justify-center">
                    <p className="font-medium text-lg text-text-primary">
                      {currency}{order.amount || 0}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Method: {order.paymentMethod || 'COD'}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Payment: {order.isPaid ? 'Paid' : 'Pending'}
                      {!order.isPaid && (
                        <button 
                          onClick={() => updatePaymentStatus(order._id)}
                          className="ml-2 text-xs text-blue-500 hover:text-blue-700 underline"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </p>
                    <button 
                      className="mt-2 text-sm text-orange-500 hover:text-orange-600 hover:underline"
                      onClick={() => {
                        // View order details (you can implement this later)
                        Toast.showInfo('Order details coming soon');
                      }}
                    >
                      View Details
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
