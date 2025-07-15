'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";

const FeaturedProduct = () => {
  const { products } = useAppContext();
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  // List of products we want to feature
  const featuredProductNames = [
    "Canon EOS R5",
    "MacBook Pro 16",
    "Samsung Projector 4k",
    "Sony WF-1000XM5"
  ];
  
  useEffect(() => {
    if (products && products.length > 0) {
      // Find our specific products by name
      const foundProducts = featuredProductNames
        .map(name => {
          // Find products that match the names we're looking for (case-insensitive contains)
          const found = products.find(p => p && p.name && p.name.toLowerCase().includes(name.toLowerCase()));
          return found;
        })
        .filter(Boolean); // Remove any undefined products
      
      setFeaturedProducts(foundProducts);
    }
  }, [products]);

  // If we don't have 3 products, use placeholders
  const displayProducts = featuredProducts.length >= 3 
    ? featuredProducts.slice(0, 4)  // Use up to 4 products
    : [
        {
          _id: "placeholder1",
          images: [assets.girl_with_headphone_image],
          name: "Unparalleled Sound",
          description: "Experience crystal-clear audio with premium headphones.",
        },
        {
          _id: "placeholder2",
          images: [assets.girl_with_earphone_image],
          name: "Stay Connected",
          description: "Compact and stylish earphones for every occasion.",
        },
        {
          _id: "placeholder3",
          images: [assets.boy_with_laptop_image],
          name: "Power in Every Pixel",
          description: "Shop the latest laptops for work, gaming, and more.",
        },
      ];

  const handleProductClick = (productId) => {
    if (productId && productId !== "placeholder1" && productId !== "placeholder2" && productId !== "placeholder3") {
      router.push(`/product/${productId}`);
    }
  };

  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium text-text-primary">Spotlight</p>
        <div className="w-28 h-0.5 bg-[#F8BD19] mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10 mt-12 md:px-14 px-4">
        {displayProducts.map((product) => (
          <div 
            key={product._id} 
            className="relative group rounded-lg overflow-hidden shadow-sm cursor-pointer h-[320px]"
            onClick={() => handleProductClick(product._id)}
          >
            <Image
              src={product.images && product.images.length > 0 ? product.images[0] : assets.upload_area}
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
