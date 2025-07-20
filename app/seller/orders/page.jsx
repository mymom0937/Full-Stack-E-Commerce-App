"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import axios from "axios";
import * as Toast from "@/lib/toast";
import { FaRegEye } from "react-icons/fa";

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

  // Get first product image from order items
  const getOrderImage = (order) => {
    if (!order.items || order.items.length === 0) {
      return assets.box_icon;
    }

    const firstItem = order.items[0];
    if (firstItem.product && firstItem.product.images && firstItem.product.images.length > 0) {
      return firstItem.product.images[0];
    }
    
    return assets.box_icon;
  };

  // Format date to readable format
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Unknown date';
    const date = new Date(dateValue);
    return date.toLocaleDateString();
  };

  // Format price to show only 2 decimal places
  const formatPrice = (price) => {
    if (!price) return '0.00';
    return parseFloat(price).toFixed(2);
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full md:p-10 p-4">
          <div className="flex justify-between items-center pb-4">
            <h2 className="text-lg font-medium">Orders</h2>
          </div>

          {processedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-card-bg rounded-lg border border-border-color">
              <div className="mb-6">
                <Image 
                  src={assets.box_icon} 
                  alt="No orders" 
                  width={80} 
                  height={80}
                  className="opacity-30"
                />
              </div>
              <p className="text-xl text-text-secondary mb-4">No orders found</p>
              <p className="text-text-secondary mb-6 text-center max-w-md">You don't have any orders yet.</p>
            </div>
          ) : (
            <>
              {/* Mobile, Tablet & Laptop Card View (visible on small, medium and large screens) */}
              <div className="xl:hidden w-full">
                <div className="grid grid-cols-1 gap-4">
                  {processedOrders.map((order, index) => (
                    <div 
                      key={order._id || index}
                      className="bg-card-bg rounded-md border border-border-color p-4 shadow-sm overflow-hidden"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-gray-500/10 rounded p-2 flex-shrink-0">
                          <Image
                            src={getOrderImage(order)}
                            alt="Order Item"
                            className="w-16 h-16 object-contain"
                            width={64}
                            height={64}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-text-primary font-medium truncate max-w-full">
                            {formatItems(order.items)}
                          </h3>
                          <p className="text-text-secondary text-sm">
                            Items: {(order.items || []).length}
                          </p>
                          <p className="font-medium text-text-primary truncate">
                            {currency.symbol}{formatPrice(order.amount)}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-border-color my-3 pt-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="overflow-hidden">
                            <p className="text-text-secondary">Customer:</p>
                            <p className="font-medium text-text-primary truncate">
                              {order.address?.fullName || 'Customer'}
                            </p>
                          </div>
                          <div>
                            <p className="text-text-secondary">Payment:</p>
                            <p className={`font-medium ${order.isPaid ? 'text-green-500' : 'text-amber-500'}`}>
                              {order.isPaid ? 'Paid' : 'Pending'}
                            </p>
                          </div>
                          <div>
                            <p className="text-text-secondary">Date:</p>
                            <p className="font-medium text-text-primary">
                              {formatDate(order.date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-text-secondary">Method:</p>
                            <p className="font-medium text-text-primary">
                              {order.paymentType || 'COD'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push(`/order-details/${order._id}`)}
                        className="w-full py-2 bg-[#F8BD19] text-white rounded-md text-sm font-medium flex items-center justify-center gap-1 mt-2"
                      >
                        <FaRegEye className="text-lg" /> View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View (visible only on extra large screens) */}
              <div className="hidden xl:block w-full overflow-x-auto">
                <div className="rounded-md bg-card-bg border border-border-color min-w-[800px]">
                  <table className="w-full">
                    <thead className="text-text-primary text-sm text-left">
                      <tr>
                        <th className="w-1/3 px-3 py-3 font-medium">Order Items</th>
                        <th className="w-1/6 px-2 py-3 font-medium">Customer</th>
                        <th className="w-1/6 px-2 py-3 font-medium">Payment</th>
                        <th className="w-1/6 px-2 py-3 font-medium">Amount</th>
                        <th className="w-1/6 px-2 py-3 font-medium text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-text-secondary">
                      {processedOrders.map((order, index) => (
                        <tr key={order._id || index} className="border-t border-border-color">
                          <td className="px-3 py-3">
                            <div className="flex items-center space-x-2">
                              <div className="bg-gray-500/10 rounded p-1 flex-shrink-0">
                                <Image
                                  src={getOrderImage(order)}
                                  alt="Order Item"
                                  className="w-10 h-10 object-contain"
                                  width={40}
                                  height={40}
                                />
                              </div>
                              <div className="min-w-0 max-w-[120px]">
                                <p className="truncate text-text-primary font-medium">
                                  {formatItems(order.items)}
                                </p>
                                <p className="text-xs text-text-secondary">
                                  Date: {formatDate(order.date)}
                                </p>
                                <p className="text-xs text-text-secondary">
                                  Items: {(order.items || []).length}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-3 max-w-[100px]">
                            <p className="font-medium truncate">{order.address?.fullName || 'Customer'}</p>
                            <p className="text-xs truncate">
                              {order.address?.city || ''}, {order.address?.state || ''}
                            </p>
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex flex-col gap-1">
                              <span className={`font-medium ${order.isPaid ? 'text-green-500' : 'text-amber-500'}`}>
                                {order.isPaid ? 'Paid' : 'Pending'}
                              </span>
                              <span className="text-xs">
                                {order.paymentType || 'COD'}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-3 font-medium whitespace-nowrap">
                            {currency.symbol}{formatPrice(order.amount)}
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex justify-center">
                              <button
                                onClick={() => router.push(`/order-details/${order._id}`)}
                                className="p-1 bg-[#F8BD19] text-white rounded-md hover:bg-[#e5ad14] transition-colors flex items-center justify-center"
                                title="View Details"
                              >
                                <FaRegEye size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
