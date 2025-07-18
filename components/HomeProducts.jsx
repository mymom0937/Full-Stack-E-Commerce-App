'use client';

import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";
import Loading from "./Loading";
import { useProducts } from "@/hooks/useProducts";

const HomeProducts = () => {
  const { router } = useAppContext();
  const { products, isLoadingProducts } = useProducts({ refreshInterval: 5000 }); // Auto-refresh every 5 seconds
  const [randomizedProducts, setRandomizedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  
  // Function to shuffle an array (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Randomize product order when products change
  useEffect(() => {
    if (products && products.length > 0) {
      // For Top Picks: randomize products
      const shuffled = shuffleArray(products);
      setRandomizedProducts(shuffled);
      
      // For Spotlight: get the most recently added products
      // Sort by createdAt timestamp (newest first)
      const sorted = [...products].sort((a, b) => {
        // Use createdAt if available, otherwise fallback to _id which often contains a timestamp
        const dateA = a.createdAt ? new Date(a.createdAt) : 
                    (a._id ? new Date(parseInt(a._id.substring(0, 8), 16) * 1000) : 0);
        const dateB = b.createdAt ? new Date(b.createdAt) : 
                    (b._id ? new Date(parseInt(b._id.substring(0, 8), 16) * 1000) : 0);
        return dateB - dateA;
      });
      
      setRecentProducts(sorted.slice(0, 4)); // Take the 4 most recent products
    } else {
      setRandomizedProducts([]);
      setRecentProducts([]);
    }
  }, [products]);

  return (
    <div className="flex flex-col items-center pt-14">
      {/* Top Picks Section */}
      <div className="flex justify-between items-center w-full mb-6">
        <p className="text-3xl font-medium text-text-primary">Top <span className="text-orange-600">Picks</span></p>
        <button 
          onClick={() => { router.push('/all-products') }} 
          className="text-sm text-orange-600 hover:underline flex items-center gap-1 transition"
        >
          View All
        </button>
      </div>

      {isLoadingProducts ? (
        <Loading variant="products" count={10} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
        {randomizedProducts && randomizedProducts.length > 0 ? (
            randomizedProducts.slice(0, 10).map((product, index) => (
              product ? <ProductCard key={product._id || index} product={product} /> : null
          ))
        ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-card-bg rounded-lg transition-colors duration-200">
              <p className="text-xl text-text-secondary mb-4">No products available</p>
              <button 
                onClick={() => router.push('/seller')} 
                className="px-6 py-2 bg-[#F8BD19] text-white rounded hover:bg-[#F8BD19]/90 transition"
              >
                Add Products
              </button>
            </div>
        )}
        </div>
      )}
      
      {/* Spotlight Section - Recently Added Products */}
      <div className="flex justify-between items-center w-full mb-6 mt-16">
        <p className="text-3xl font-medium text-text-primary">Spotlight <span className="text-orange-600">New Arrivals</span></p>
        <button 
          onClick={() => { router.push('/all-products') }} 
          className="text-sm text-orange-600 hover:underline flex items-center gap-1 transition"
        >
          View All
        </button>
      </div>
      
      {isLoadingProducts ? (
        <Loading variant="products" count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {recentProducts && recentProducts.length > 0 ? (
            recentProducts.map((product, index) => (
              product ? 
                <div key={product._id || index} className="relative">
                  {index === 0 && (
                    <div className="absolute top-2 left-2 z-10 bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                      Just Added
                    </div>
                  )}
                  <ProductCard product={product} />
                </div> : null
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-card-bg rounded-lg transition-colors duration-200">
              <p className="text-xl text-text-secondary mb-4">No new products available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeProducts;
