'use client';

import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";
import Loading from "./Loading";
import { useProducts } from "@/hooks/useProducts";
import StaggeredList from "./animations/StaggeredList";
import AnimationWrapper, { slideUp } from "./animations/AnimationWrapper";
import { motion } from "framer-motion";

const HomeProducts = () => {
  const { router } = useAppContext();
  const { products, isLoadingProducts } = useProducts({ refreshInterval: 5000 }); // Auto-refresh every 5 seconds
  const [randomizedProducts, setRandomizedProducts] = useState([]);
  
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
    } else {
      setRandomizedProducts([]);
    }
  }, [products]);

  return (
    <div className="flex flex-col items-center pt-4">
      {/* Top Picks Section - Centered heading like Spotlight */}
      <AnimationWrapper variants={slideUp}>
        <div className="flex flex-col items-center">
          <p className="text-3xl font-medium text-text-primary">Top <span className="text-orange-600">Picks</span></p>
          <div className="w-28 h-0.5 bg-[#F8BD19] mt-2"></div>
        </div>
      </AnimationWrapper>
      
      <div className="flex justify-between items-center w-full mb-6 mt-4">
        <div></div> {/* Empty div for spacing */}
        <motion.button 
          onClick={() => { router.push('/all-products') }} 
          className="text-sm text-orange-600 hover:underline flex items-center gap-1 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View All
        </motion.button>
      </div>

      {isLoadingProducts ? (
        <Loading variant="products" count={10} />
      ) : (
        <StaggeredList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
        {randomizedProducts && randomizedProducts.length > 0 ? (
            randomizedProducts.slice(0, 10).map((product, index) => (
              product ? <ProductCard key={product._id || index} product={product} /> : null
          ))
        ) : (
            <motion.div 
              className="col-span-full flex flex-col items-center justify-center py-16 bg-card-bg rounded-lg transition-colors duration-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xl text-text-secondary mb-4">No products available</p>
              <motion.button 
                onClick={() => router.push('/seller')} 
                className="px-6 py-2 bg-[#F8BD19] text-white rounded hover:bg-[#F8BD19]/90 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add Products
              </motion.button>
            </motion.div>
        )}
        </StaggeredList>
      )}
    </div>
  );
};

export default HomeProducts;
