"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import * as Toast from "@/lib/toast";

const Orders = () => {
  const { currency, getToken, user, products } = useAppContext();

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
                <p className="font-medium my-auto">
                  {currency}
                    {order.amount || 0}
                </p>
                <div>
                  <p className="flex flex-col">
                      <span>Method: {order.paymentMethod || 'COD'}</span>
                    <span>
                        Date: {order.date ? new Date(order.date).toLocaleDateString() : 'Unknown date'}
                    </span>
                      <span>Payment: {order.paymentStatus || 'Pending'}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Orders;
