"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import Breadcrumb from "@/components/Breadcrumb";
import OptimizedImage from "@/components/OptimizedImage";
import axios from "axios";
import * as Toast from "@/lib/toast";
import Image from "next/image";

const OrderDetails = ({ params }) => {
  const { id } = params;
  const { currency, getToken, user, products, router } = useAppContext();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const [processedItems, setProcessedItems] = useState([]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get(`/api/order/details/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setOrder(data.order);
        processOrderItems(data.order);
      } else {
        Toast.showError(data.message || "Failed to fetch order details");
      }
    } catch (error) {
      Toast.handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // Process order items to match with products
  const processOrderItems = (orderData) => {
    if (!orderData || !orderData.items || !Array.isArray(orderData.items)) {
      setProcessedItems([]);
      return;
    }

    const items = orderData.items.map(item => {
      // Try to find product in the products context
      let productData = null;
      
      // If item.product is an object (already populated)
      if (item.product && typeof item.product === 'object') {
        productData = item.product;
      } 
      // If item.product is an ID, try to find it in products context
      else if (item.product) {
        productData = products.find(p => p._id === item.product);
      }

      // Set fallback values if product not found
      const productName = productData?.name || item.productName || "Product";
      const productImage = productData?.images?.[0] || productData?.image?.[0] || "/placeholder-image.png";
      const price = item.price || productData?.price || productData?.offerPrice || 0;
      const quantity = item.quantity || 1;

      return {
        ...item,
        productName,
        productImage,
        price,
        quantity,
        totalPrice: price * quantity
      };
    });

    setProcessedItems(items);
  };

  useEffect(() => {
    if (user) {
      setIsSeller(user.role === "seller");
    }
  }, [user]);

  useEffect(() => {
    if (user && id) {
      fetchOrderDetails();
    }
  }, [user, id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  // Calculate order totals
  const calculateTotals = () => {
    if (!processedItems.length) {
      return {
        subtotal: 0,
        shipping: order?.shippingCost || 0,
        tax: order?.tax || 0,
        discount: order?.discount || 0,
        total: order?.amount || order?.total || 0
      };
    }

    const subtotal = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = order?.shippingCost || 0;
    const tax = order?.tax || 0;
    const discount = order?.discount || 0;
    const total = order?.amount || order?.total || subtotal + shipping + tax - discount;

    return { subtotal, shipping, tax, discount, total };
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-[calc(100vh-300px)]">
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-xl text-text-secondary mb-4">Please log in to view your order details</p>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-3 bg-[#F8BD19] text-white rounded hover:bg-[#F8BD19]/90 transition"
            >
              Log In
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Get totals for display
  const totals = calculateTotals();

  return (
    <>
      {!isSeller && <Navbar />}
      <div className={`flex flex-col justify-between ${isSeller ? 'px-4 md:px-10' : 'px-6 md:px-16 lg:px-32'} py-6 min-h-[calc(100vh-300px)]`}>
        <div className="space-y-5">
          {/* Breadcrumb */}
          {!isSeller && (
            <Breadcrumb currentPage="Order Details" />
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(isSeller ? "/seller/orders" : "/my-orders")}
              className="flex items-center text-sm text-[#F8BD19] hover:text-[#F8BD19]/80"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1 rotate-180">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
              </svg>
              Back to Orders
            </button>
          </div>

          {loading ? (
            <Loading />
          ) : !order ? (
            <div className="flex flex-col items-center justify-center py-16 bg-card-bg rounded-lg border border-border-color">
              <p className="text-xl text-text-secondary mb-4">
                Order not found
              </p>
              <button
                onClick={() => router.push("/my-orders")}
                className="px-6 py-3 bg-[#F8BD19] text-white rounded hover:bg-[#F8BD19]/90 transition"
              >
                Go Back to Orders
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Summary */}
              <div className="lg:col-span-2">
                <div className="border border-border-color rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-medium mb-4">Order Summary</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-text-secondary">Order ID</p>
                      <p className="font-medium">{order._id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Order Date</p>
                      <p className="font-medium">{formatDate(order.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Payment Method</p>
                      <p className="font-medium flex items-center">
                        {order.paymentMethod === "stripe" || order.paymentType === "Stripe" ? (
                          <>
                            <span>Stripe</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-1 text-blue-500">
                              <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                              <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
                            </svg>
                          </>
                        ) : order.paymentMethod === "cod" || order.paymentType === "COD" ? (
                          <>
                            <span>Cash on Delivery</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-1 text-green-500">
                              <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" />
                              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a4.124 4.124 0 001.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 00-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 00.933-1.175l-.415-.33a3.836 3.836 0 00-1.719-.755V6z" clipRule="evenodd" />
                            </svg>
                          </>
                        ) : (
                          "Other"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Payment Status</p>
                      <p className="font-medium">
                        {order.isPaid ? (
                          <span className="inline-flex items-center text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                            </svg>
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-amber-600">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                            </svg>
                            Pending
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-text-secondary mb-2">Order Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusClass(order.status)}`}>
                      {order.status || "Processing"}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border border-border-color rounded-lg p-6">
                  <h3 className="text-xl font-medium mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {processedItems.length > 0 ? (
                      processedItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 border border-border-color rounded-md">
                          <div className="w-16 h-16 rounded-md overflow-hidden border border-border-color">
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.productName}</h4>
                            <p className="text-sm text-text-secondary">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{currency.symbol}{item.totalPrice.toFixed(2)}</p>
                            <p className="text-sm text-text-secondary">
                              {currency.symbol}{item.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-text-secondary">No items in this order</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Details Sidebar */}
              <div className="lg:col-span-1">
                {/* Shipping Address */}
                <div className="border border-border-color rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium mb-3">Shipping Address</h3>
                  {order.address && typeof order.address === 'object' ? (
                    <div>
                      <p className="font-medium">{order.address.fullName}</p>
                      <p>{order.address.area}</p>
                      <p>{order.address.city}, {order.address.state}</p>
                      <p>{order.address.phoneNumber}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">{order.fullName || order.name || 'Customer'}</p>
                      <p>{order.area || ''}</p>
                      <p>{order.city || ''}, {order.state || ''}</p>
                      <p>{order.phoneNumber || ''}</p>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="border border-border-color rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-3">Price Details</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <p className="text-text-secondary">Subtotal</p>
                      <p>{currency.symbol}{totals.subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-text-secondary">Shipping</p>
                      <p>{currency.symbol}{totals.shipping.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-text-secondary">Tax</p>
                      <p>{currency.symbol}{totals.tax.toFixed(2)}</p>
                    </div>
                    {totals.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <p>Discount</p>
                        <p>-{currency.symbol}{totals.discount.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border-color pt-3">
                    <div className="flex justify-between font-medium text-lg">
                      <p>Total</p>
                      <p>{currency.symbol}{totals.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {!isSeller && <Footer />}
    </>
  );
};

export default OrderDetails; 