'use client';

import useSWR from 'swr';
import { useAppContext } from '@/context/AppContext';

export function useUserData(options = {}) {
  const { getToken, user } = useAppContext();
  
  // For user data including cart and wishlist
  const { data: userData, error: userError, mutate: refreshUserData } = useSWR(
    user ? '/api/user/data' : null,
    async (url) => {
      const token = await getToken();
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!res.ok) throw new Error('Failed to fetch user data');
      return res.json();
    },
    { 
      refreshInterval: options.refreshInterval || 10000, // Refresh every 10 seconds by default
      dedupingInterval: 2000, // Only revalidate after 2 seconds
    }
  );

  // For user addresses
  const { data: addressData, error: addressError, mutate: refreshAddresses } = useSWR(
    user ? '/api/user/get-address' : null,
    async (url) => {
      const token = await getToken();
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!res.ok) throw new Error('Failed to fetch addresses');
      return res.json();
    },
    { 
      refreshInterval: options.refreshInterval || 10000,
      dedupingInterval: 2000,
    }
  );

  // For user wishlist
  const { data: wishlistData, error: wishlistError, mutate: refreshWishlist } = useSWR(
    user ? '/api/user/wishlist' : null,
    async (url) => {
      const token = await getToken();
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!res.ok) throw new Error('Failed to fetch wishlist');
      return res.json();
    },
    {
      refreshInterval: options.refreshInterval || 10000,
      dedupingInterval: 2000,
    }
  );

  // Function to manually trigger refresh for all user data
  const refreshAll = () => {
    refreshUserData();
    refreshAddresses();
    refreshWishlist();
  };

  return {
    userData: userData?.user || null,
    cartItems: userData?.user?.cartItems || {},
    wishlist: wishlistData?.wishlist || [],
    addresses: addressData?.address || [],
    isLoadingUserData: !userError && !userData,
    isLoadingAddresses: !addressError && !addressData,
    isLoadingWishlist: !wishlistError && !wishlistData,
    isErrorUserData: userError,
    isErrorAddresses: addressError,
    isErrorWishlist: wishlistError,
    refreshUserData,
    refreshAddresses,
    refreshWishlist,
    refreshAll,
  };
} 