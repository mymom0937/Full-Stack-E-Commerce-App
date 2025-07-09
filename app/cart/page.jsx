'use client'
import React from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import OptimizedImage from "@/components/OptimizedImage";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

const Cart = () => {
  const { products, router, cartItems, addToCart, updateCartQuantity, getCartCount } = useAppContext();

  // Check if the cart is empty
  const isCartEmpty = !cartItems || Object.keys(cartItems).filter(key => cartItems[key] > 0).length === 0;

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
        <div className="flex-1">
          {/* Breadcrumb */}
          <Breadcrumb currentPage="Cart" />

          <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
            <p className="text-2xl md:text-3xl text-gray-500">
              Your <span className="font-medium text-orange-600">Cart</span>
            </p>
            <p className="text-lg md:text-xl text-gray-500/80">{getCartCount()} Items</p>
          </div>

          {isCartEmpty ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg mb-6">
              <div className="mb-6">
                <Image 
                  src={assets.cart_icon} 
                  alt="Empty cart" 
                  width={80} 
                  height={80}
                  className="opacity-30"
                />
              </div>
              <p className="text-xl text-gray-500 mb-4">Your cart is empty</p>
              <p className="text-gray-400 mb-6 text-center max-w-md">Looks like you haven't added any products to your cart yet.</p>
              <button 
                onClick={() => router.push('/all-products')} 
                className="px-6 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="text-left">
                <tr>
                  <th className="text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Product Details
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Price
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Quantity
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(cartItems).map((itemId) => {
                  const product = products.find(product => product._id === itemId);

                  if (!product || cartItems[itemId] <= 0) return null;
                  
                  // Determine product image source with fallback
                  const productImage = product.image && Array.isArray(product.image) && product.image.length > 0 
                    ? product.image[0] 
                    : product.images && Array.isArray(product.images) && product.images.length > 0 
                      ? product.images[0] 
                      : typeof product.image === 'string' 
                        ? product.image 
                        : typeof product.images === 'string' 
                          ? product.images 
                          : '/placeholder-image.png';

                  return (
                      <tr key={itemId} className="border-b border-gray-100">
                      <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                          <div className="flex-shrink-0">
                            <div onClick={() => router.push(`/product/${product._id}`)} 
                                 className="rounded-lg overflow-hidden w-20 h-20 cursor-pointer">
                              <OptimizedImage
                              src={productImage}
                              alt={product.name}
                                width={200}
                                height={200}
                                className="w-20 h-20"
                                objectFit="contain"
                            />
                          </div>
                          <button
                            className="md:hidden text-xs text-orange-600 mt-1"
                            onClick={() => updateCartQuantity(product._id, 0)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-sm hidden md:block">
                            <p className="text-gray-800 font-medium hover:text-orange-500 cursor-pointer" 
                               onClick={() => router.push(`/product/${product._id}`)}>
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              {product.category || "Uncategorized"}
                            </p>
                          <button
                              className="text-xs text-orange-600 hover:underline"
                            onClick={() => updateCartQuantity(product._id, 0)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                        <td className="py-4 md:px-4 px-1 text-gray-600 font-medium">${product.offerPrice}</td>
                      <td className="py-4 md:px-4 px-1">
                          <div className="flex items-center md:gap-2 gap-1 border rounded-md w-fit">
                            <button 
                              onClick={() => updateCartQuantity(product._id, cartItems[itemId] - 1)}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                            >
                            <Image
                              src={assets.decrease_arrow}
                              alt="decrease_arrow"
                              className="w-4 h-4"
                            />
                          </button>
                            <input 
                              onChange={e => updateCartQuantity(product._id, Number(e.target.value))} 
                              type="number" 
                              value={cartItems[itemId]} 
                              className="w-10 text-center appearance-none border-x bg-transparent"
                              min="1"
                            />
                            <button 
                              onClick={() => addToCart(product._id)}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                            >
                            <Image
                              src={assets.increase_arrow}
                              alt="increase_arrow"
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                      </td>
                        <td className="py-4 md:px-4 px-1 font-medium">${(product.offerPrice * cartItems[itemId]).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
          
          <button onClick={()=> router.push('/all-products')} className="group flex items-center mt-6 gap-2 text-orange-600 hover:underline">
            <Image
              className="group-hover:-translate-x-1 transition"
              src={assets.arrow_right_icon_colored}
              alt="arrow_right_icon_colored"
            />
            Continue Shopping
          </button>
        </div>
        
        <OrderSummary />
      </div>
      <Footer />
    </>
  );
};

export default Cart;
