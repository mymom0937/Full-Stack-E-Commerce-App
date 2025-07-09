"use client";
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Loading from '@/components/Loading';
import Breadcrumb from '@/components/Breadcrumb';
import Image from 'next/image';
import { assets } from '@/assets/assets';

const WishlistPage = () => {
  const { wishlist, products, isLoading, router } = useAppContext();
  const [wishlistProducts, setWishlistProducts] = useState([]);

  useEffect(() => {
    if (products.length > 0 && wishlist.length > 0) {
      const filteredProducts = products.filter(product => 
        product && wishlist.includes(product._id)
      );
      setWishlistProducts(filteredProducts);
    } else {
      setWishlistProducts([]);
    }
  }, [products, wishlist]);

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-300px)] px-6 md:px-16 lg:px-32 py-10">
        {/* Breadcrumb */}
        <Breadcrumb currentPage="My Wishlist" />
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-medium">My Wishlist</h1>
          <p className="text-gray-500">{wishlistProducts.length} items</p>
        </div>

        {isLoading ? (
          <Loading variant="products" count={4} />
        ) : wishlistProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
            <div className="mb-6">
              <Image 
                src={assets.heart_icon} 
                alt="Empty wishlist" 
                width={80} 
                height={80}
                className="opacity-30"
              />
            </div>
            <p className="text-xl text-gray-500 mb-4">Your wishlist is empty</p>
            <p className="text-gray-400 mb-6 text-center max-w-md">
              Add items to your wishlist by clicking the heart icon on products you love.
            </p>
            <button 
              onClick={() => router.push('/all-products')} 
              className="px-6 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default WishlistPage; 