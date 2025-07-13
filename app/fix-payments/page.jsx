"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import * as Toast from "@/lib/toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FixPayments = () => {
  const { getToken, user, router } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    fetchOrders();
  }, [user]);

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
        // Filter to show only Stripe orders
        const stripeOrders = data.orders.filter(
          (order) => order.paymentType === "Stripe"
        );
        setOrders(stripeOrders);
      } else {
        Toast.showError(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      Toast.handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const fixPayment = async (orderId) => {
    try {
      setProcessing((prev) => ({ ...prev, [orderId]: true }));
      const token = await getToken();
      const { data } = await axios.post(
        "/api/order/fix-payments",
        { orderId, triggerInngest: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        Toast.showSuccess(data.message || "Payment fixed successfully");
        // Refresh the orders list
        fetchOrders();
      } else {
        Toast.showError(data.message || "Failed to fix payment");
      }
    } catch (error) {
      Toast.handleApiError(error);
    } finally {
      setProcessing((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const fixAllPayments = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.post(
        "/api/order/update-payment",
        { fixAll: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        Toast.showSuccess(data.message || "All payments fixed successfully");
        // Refresh the orders list
        fetchOrders();
      } else {
        Toast.showError(data.message || "Failed to fix payments");
      }
    } catch (error) {
      Toast.handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Fix Payment Status</h1>
        
        <div className="mb-6">
          <button
            onClick={fixAllPayments}
            disabled={loading}
            className="px-4 py-2 bg-[#F8BD19] text-white rounded hover:bg-[#F8BD19]/90 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Fix All Stripe Payments"}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {loading ? "Loading orders..." : "No Stripe orders found"}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {order._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ${order.amount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.isPaid
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                        }`}
                      >
                        {order.isPaid ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => fixPayment(order._id)}
                        disabled={processing[order._id] || order.isPaid}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50"
                      >
                        {processing[order._id]
                          ? "Processing..."
                          : order.isPaid
                          ? "Already Paid"
                          : "Fix & Trigger Inngest"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FixPayments; 