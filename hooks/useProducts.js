'use client';

import useSWR from 'swr';
import { useAppContext } from '@/context/AppContext';

export function useProducts(options = {}) {
  const { getToken } = useAppContext();
  
  // For public product list (no auth needed)
  const { data: publicProducts, error: publicError, mutate: refreshPublicProducts } = useSWR(
    '/api/product/list',
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    { 
      refreshInterval: options.refreshInterval || 10000, // Refresh every 10 seconds by default
      dedupingInterval: 2000, // Only revalidate after 2 seconds
    }
  );

  // For seller's products (auth needed)
  const { data: sellerProducts, error: sellerError, mutate: refreshSellerProducts } = useSWR(
    getToken ? '/api/product/seller-list' : null,
    async (url) => {
      const token = await getToken();
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!res.ok) throw new Error('Failed to fetch seller products');
      return res.json();
    },
    { 
      refreshInterval: options.refreshInterval || 10000, // Refresh every 10 seconds by default
      dedupingInterval: 2000, // Only revalidate after 2 seconds
    }
  );

  // Function to manually trigger refresh for both lists
  const refreshProducts = () => {
    refreshPublicProducts();
    refreshSellerProducts();
  };

  // Individual product fetching (by ID)
  const useProductById = (productId) => {
    const { data, error, mutate } = useSWR(
      productId ? `/api/product/${productId}` : null,
      async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch product');
        return res.json();
      },
      {
        refreshInterval: options.refreshInterval || 10000,
        dedupingInterval: 2000,
      }
    );

    return {
      product: data?.product,
      isLoading: !error && !data,
      isError: error,
      refresh: mutate
    };
  };

  // Get product by ID directly (not as a hook)
  const getProductById = async (productId) => {
    try {
      const res = await fetch(`/api/product/${productId}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      const data = await res.json();
      return data.product;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  };

  return {
    products: publicProducts?.products || [],
    sellerProducts: sellerProducts?.products || [],
    isLoadingProducts: !publicError && !publicProducts,
    isLoadingSellerProducts: !sellerError && !sellerProducts,
    isErrorProducts: publicError,
    isErrorSellerProducts: sellerError,
    refreshProducts,
    refreshPublicProducts,
    refreshSellerProducts,
    useProductById,
    getProductById,
  };
} 