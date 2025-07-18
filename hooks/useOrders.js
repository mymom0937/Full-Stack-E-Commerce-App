'use client';

import useSWR from 'swr';
import { useAppContext } from '@/context/AppContext';

export function useOrders(options = {}) {
  const { getToken, user } = useAppContext();
  
  // For customer orders
  const { data: customerOrders, error: customerError, mutate: refreshCustomerOrders } = useSWR(
    user ? '/api/order/list' : null,
    async (url) => {
      const token = await getToken();
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!res.ok) throw new Error('Failed to fetch customer orders');
      return res.json();
    },
    { 
      refreshInterval: options.refreshInterval || 10000, // Refresh every 10 seconds by default
      dedupingInterval: 2000, // Only revalidate after 2 seconds
    }
  );

  // For seller orders
  const { data: sellerOrders, error: sellerError, mutate: refreshSellerOrders } = useSWR(
    user ? '/api/order/seller-orders' : null,
    async (url) => {
      const token = await getToken();
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!res.ok) throw new Error('Failed to fetch seller orders');
      return res.json();
    },
    { 
      refreshInterval: options.refreshInterval || 10000, // Refresh every 10 seconds by default
      dedupingInterval: 2000, // Only revalidate after 2 seconds
    }
  );

  // Function to manually trigger refresh for both lists
  const refreshOrders = () => {
    refreshCustomerOrders();
    refreshSellerOrders();
  };

  // Get individual order details
  const getOrderById = (orderId) => {
    const { data, error, mutate } = useSWR(
      orderId && user ? `/api/order/details/${orderId}` : null,
      async (url) => {
        const token = await getToken();
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        if (!res.ok) throw new Error('Failed to fetch order details');
        return res.json();
      },
      {
        refreshInterval: options.refreshInterval || 10000,
        dedupingInterval: 2000,
      }
    );

    return {
      order: data?.order,
      isLoading: !error && !data,
      isError: error,
      refresh: mutate
    };
  };

  return {
    customerOrders: customerOrders?.orders || [],
    sellerOrders: sellerOrders?.orders || [],
    isLoadingCustomerOrders: !customerError && !customerOrders,
    isLoadingSellerOrders: !sellerError && !sellerOrders,
    isErrorCustomerOrders: customerError,
    isErrorSellerOrders: sellerError,
    refreshOrders,
    refreshCustomerOrders,
    refreshSellerOrders,
    getOrderById,
  };
} 