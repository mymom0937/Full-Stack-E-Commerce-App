'use client';

import { SWRConfig } from 'swr';

// Global SWR configuration
export const SWRProvider = ({ children }) => {
  return (
    <SWRConfig
      value={{
        refreshInterval: 10000, // Refresh data every 10 seconds
        revalidateOnFocus: true, // Refresh when the window regains focus
        revalidateOnReconnect: true, // Refresh when the client reconnects to the network
        dedupingInterval: 5000, // Deduplicate requests within 5 seconds
        errorRetryInterval: 5000, // Retry interval for errors
        fetcher: async (url) => {
          const res = await fetch(url);
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const error = new Error('An error occurred while fetching the data.');
            error.info = errorData;
            error.status = res.status;
            throw error;
          }
          return res.json();
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};

// Custom SWR hook for fetching data with authentication
export const useAuthenticatedFetcher = (getToken) => {
  return async (url) => {
    try {
      // Get the authentication token
      const token = await getToken();
      
      // Make the authenticated request
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Handle errors
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const error = new Error('An error occurred while fetching the data.');
        error.info = errorData;
        error.status = res.status;
        throw error;
      }
      
      return res.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };
}; 