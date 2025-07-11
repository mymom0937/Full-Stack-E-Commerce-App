"use client";
import { useAppContext } from "@/context/AppContext";
import React, { useState } from "react";
import axios from "axios";

const FixPayments = () => {
  const { getToken } = useAppContext();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const fixAllOrders = async () => {
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
      setMessage(data.message || "Orders updated successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fixRecentOrders = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.post(
        "/api/order/update-payment",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(data.message || "Recent orders updated successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card-bg p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Fix Payment Status</h1>
        
        <div className="space-y-6">
          <div>
            <button
              onClick={fixAllOrders}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Fix ALL Stripe Orders"}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              This will mark all Stripe orders as paid.
            </p>
          </div>
          
          <div>
            <button
              onClick={fixRecentOrders}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Fix Recent Orders Only"}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              This will mark the 5 most recent unpaid Stripe orders as paid.
            </p>
          </div>
          
          {message && (
            <div className="bg-gray-100 p-4 rounded-md mt-4 text-center">
              {message}
            </div>
          )}
          
          <div className="text-center mt-6">
            <a href="/my-orders" className="text-orange-600 hover:underline">
              Back to My Orders
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixPayments; 