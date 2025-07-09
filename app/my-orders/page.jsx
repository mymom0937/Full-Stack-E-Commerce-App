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
  const { currency, getToken, user, router } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
              <div className="mb-6">
                <Image 
                  src={assets.order_icon} 
                  alt="Empty orders" 
                  width={80} 
                  height={80}
                  className="opacity-30"
                />
              </div>
              <p className="text-xl text-gray-500 mb-4">No orders found</p>
              <p className="text-gray-400 mb-6 text-center max-w-md">You haven't placed any orders yet.</p>
              <button 
                onClick={() => router.push('/all-products')} 
                className="px-6 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="max-w-5xl border border-gray-200 rounded-lg shadow-sm">
              {orders.map((order, index) => (
                <div
                  key={order._id || index}
                  className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <div className="flex-1 flex gap-5">
                    <div className="flex flex-wrap gap-2">
                      {(order.items || []).slice(0, 3).map((item, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                          <OptimizedImage
                            src={item.product?.image?.[0] || item.product?.images?.[0] || '/placeholder-image.png'}
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
                        <div className="flex items-center justify-center w-16 h-16 rounded-md bg-gray-100 text-gray-500 text-sm">
                          +{(order.items || []).length - 3} more
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-base">
                        {(order.items || []).map(item => item.product?.name || 'Product').join(", ").substring(0, 70)}
                        {(order.items || []).map(item => item.product?.name || 'Product').join(", ").length > 70 ? '...' : ''}
                      </p>
                      <p className="text-sm text-gray-500">
                        Order #{order._id?.substring(0, 8) || index}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.date ? new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Unknown date'}
                      </p>
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(order.status || 'Pending')}`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 items-end justify-center">
                    <p className="font-medium text-lg">
                      {currency}{order.amount || 0}
                    </p>
                    <p className="text-sm text-gray-500">
                      Payment: {order.paymentMethod || 'COD'}
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
