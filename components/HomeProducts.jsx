import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";
import Loading from "./Loading";

const HomeProducts = () => {
  const { products, router, isLoading } = useAppContext();

  return (
    <div className="flex flex-col items-center pt-14">
      <div className="flex justify-between items-center w-full mb-6">
        <p className="text-3xl font-medium">Popular <span className="text-orange-600">Products</span></p>
        <button 
          onClick={() => { router.push('/all-products') }} 
          className="text-sm text-orange-600 hover:underline flex items-center gap-1 transition"
        >
          View All
        </button>
      </div>

      {isLoading ? (
        <Loading variant="products" count={10} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
          {products && products.length > 0 ? (
            products.slice(0, 10).map((product, index) => (
              product ? <ProductCard key={product._id || index} product={product} /> : null
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
              <p className="text-xl text-gray-500 mb-4">No products available</p>
              <button 
                onClick={() => router.push('/seller')} 
                className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
              >
                Add Products
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeProducts;
