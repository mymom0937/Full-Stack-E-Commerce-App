'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import Loading from "./Loading";

const FeaturedProduct = () => {
  const { products, isLoadingProducts } = useProducts({ refreshInterval: 5000 }); // Auto-refresh every 5 seconds
  const router = useRouter();
  const [recentProducts, setRecentProducts] = useState([]);
  
  useEffect(() => {
    if (products && products.length > 0) {
      // Get the most recently added products
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
      setRecentProducts([]);
    }
  }, [products]);

  const handleProductClick = (productId) => {
    if (productId) {
      router.push(`/product/${productId}`);
    }
  };
  
  // If we don't have any products, don't render the section
  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium text-text-primary">Spotlight</p>
        <div className="w-28 h-0.5 bg-[#F8BD19] mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10 mt-12 md:px-14 px-4">
        {recentProducts.map((product, index) => (
          <div 
            key={product._id} 
            className="relative group rounded-lg overflow-hidden shadow-sm cursor-pointer h-[320px]"
            onClick={() => handleProductClick(product._id)}
          >
            {/* Add "New" badge to the most recent product */}
            {index === 0 && (
              <div className="absolute top-3 left-3 z-10 bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                Just Added
              </div>
            )}
            <Image
              src={product.images && product.images.length > 0 ? product.images[0] : (
                product.image && Array.isArray(product.image) && product.image.length > 0 
                  ? product.image[0] 
                  : typeof product.image === 'string' 
                    ? product.image 
                    : assets.upload_area
              )}
              alt={product.name}
              width={500}
              height={500}
              className="group-hover:brightness-75 transition duration-300 w-full h-full object-cover"
            />
            <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-8 left-8 text-white space-y-2">
              <p className="font-medium text-xl lg:text-2xl">{product.name}</p>
              <p className="text-sm lg:text-base leading-5 max-w-60 line-clamp-2">
                {product.description || "High-quality product with premium features."}
              </p>
              <button className="flex items-center gap-1.5 bg-[#F8BD19] px-4 py-2 rounded">
                View Details <Image className="h-3 w-3" src={assets.redirect_icon} alt="Redirect Icon" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProduct;
