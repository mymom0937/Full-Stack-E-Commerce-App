"use client"
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading, { ImageSkeleton, TextSkeleton } from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import React from "react";
import * as Toast from "@/lib/toast";
import Script from "next/script";
import OptimizedImage from "@/components/OptimizedImage";
import Breadcrumb from "@/components/Breadcrumb";
import { useProducts } from "@/hooks/useProducts";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/animations/PageTransition";
import AnimationWrapper, { fadeIn, slideUp, slideInLeft, slideInRight, popIn } from "@/components/animations/AnimationWrapper";
import StaggeredList from "@/components/animations/StaggeredList";

// Helper function to generate product structured data
const generateProductStructuredData = (product) => {
    if (!product) return null;

    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": Array.isArray(product.images) && product.images.length > 0 
            ? product.images[0] 
            : typeof product.images === 'string' ? product.images : "",
        "offers": {
            "@type": "Offer",
            "price": product.offerPrice,
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
        },
        "brand": {
            "@type": "Brand",
            "name": "Generic"
        },
        "category": product.category || "Uncategorized",
    };
};

const Product = () => {
    const { id } = useParams();
    const { router, addToCart, isInWishlist, toggleWishlist } = useAppContext();
    const { useProductById, products } = useProducts({ refreshInterval: 5000 }); // Refresh every 5 seconds
    const { product, isLoading: productLoading, isError } = useProductById(id);
    
    const [mainImage, setMainImage] = useState(null);
    const [productImages, setProductImages] = useState([]);
    const [structuredData, setStructuredData] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isLikeAnimating, setIsLikeAnimating] = useState(false);

    // Process product data whenever it changes
    useEffect(() => {
        if (product) {
                // Check if product is in wishlist
                setIsLiked(isInWishlist(product._id));
            
            // Handle both image and images fields
            let images = [];
            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                images = product.images;
            } else if (product.image && Array.isArray(product.image) && product.image.length > 0) {
                images = product.image;
            } else if (typeof product.images === 'string') {
                images = [product.images];
            } else if (typeof product.image === 'string') {
                images = [product.image];
            }
            
            setProductImages(images);
            if (images.length > 0) {
                setMainImage(images[0]);
            }
                
                // Generate structured data
                setStructuredData(generateProductStructuredData(product));
        }
    }, [product, isInWishlist]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product._id);
        Toast.showSuccess("Added to cart");
    };

    const handleBuyNow = () => {
        if (!product) return;
        addToCart(product._id);
        router.push('/cart');
    };
    
    const handleToggleWishlist = async () => {
        if (!product) return;
        
        // Start animation
        setIsLikeAnimating(true);
        
        // Toggle wishlist status
        const result = await toggleWishlist(product._id);
        
        // Update local state if we got a valid result
        if (result !== null) {
            setIsLiked(result);
        }
        
        // End animation after a short delay
        setTimeout(() => {
            setIsLikeAnimating(false);
        }, 500);
    };
    
    // Update liked status when wishlist changes
    useEffect(() => {
        if (product) {
            setIsLiked(isInWishlist(product._id));
        }
    }, [isInWishlist, product]);

    // Calculate page title and meta description for SEO
    const pageTitle = product 
        ? `${product.name} | ${product.category || 'Product'}`
        : 'Product Details';
        
    const pageDescription = product
        ? `${product.description?.substring(0, 150)}...`
        : 'View product details, specifications, and pricing.';

    if (productLoading) return (
        <>
            <Navbar />
            <div className="px-6 md:px-16 lg:px-32 pt-20 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="px-5 lg:px-16 xl:px-20">
                        <ImageSkeleton className="w-full h-80 rounded-lg mb-4" />
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => <ImageSkeleton key={i} className="w-full h-16 rounded-lg" />)}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <TextSkeleton height="h-8" />
                        <TextSkeleton width="w-24" />
                        <TextSkeleton height="h-24" />
                        <TextSkeleton width="w-32" height="h-6" />
                        <div className="h-0.5 bg-gray-200 w-full my-4"></div>
                        <div className="space-y-4">
                            <TextSkeleton width="w-full" />
                            <TextSkeleton width="w-full" />
                            <TextSkeleton width="w-full" />
                        </div>
                        <div className="flex gap-4 mt-6">
                            <TextSkeleton width="w-32" height="h-12" />
                            <TextSkeleton width="w-32" height="h-12" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
    
    if (isError || !product) return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 md:px-16 lg:px-32 pt-20">
                <h1 className="text-2xl font-medium text-text-primary mb-4">Product not found</h1>
                <p className="text-text-secondary mb-6">We couldn't find the product you're looking for.</p>
                <button 
                    onClick={() => router.push('/all-products')}
                    className="px-6 py-2 bg-[#F8BD19] text-white rounded hover:bg-[#F8BD19]/90 transition"
                >
                    View All Products
                </button>
            </div>
            <Footer />
        </>
    );
    
    if (productImages.length === 0) {
        // Fallback if no images are available
        productImages.push('/placeholder-image.png');
    }

    // Calculate discount percentage
    const discount = product.price && product.offerPrice 
        ? Math.round(((product.price - product.offerPrice) / product.price) * 100) 
        : 0;

    // Filter for related products
    const relatedProducts = products
        .filter(p => p && p._id !== id && p.category === product.category)
        .slice(0, 5);

    return (
        <>
            {structuredData && (
                <Script id="product-schema" type="application/ld+json" 
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            )}
            
            <Navbar />
            <PageTransition>
            <div className="px-6 md:px-16 lg:px-32 pt-20 space-y-10">
                {/* Breadcrumb */}
                    <AnimationWrapper>
                <Breadcrumb 
                    items={[]} 
                            currentPage={product.name}
                />
                    </AnimationWrapper>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <AnimationWrapper variants={slideInLeft}>
                    <div className="px-5 lg:px-16 xl:px-20">
                                <motion.div 
                                    className="rounded-lg overflow-hidden mb-4 relative"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                            {discount > 0 && (
                                        <motion.div 
                                            className="absolute top-4 left-4 bg-[#F8BD19] text-white text-sm px-3 py-1 rounded z-10"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                    -{discount}% OFF
                                        </motion.div>
                            )}
                            <OptimizedImage
                                src={mainImage || productImages[0]}
                                        alt={product.name || "Product"}
                                className="w-full h-auto"
                                width={1280}
                                        height={800}
                                    />

                                    <motion.button 
                                        onClick={handleToggleWishlist}
                                        className="absolute top-4 right-4 bg-white p-2 rounded-full"
                                        whileTap={{ scale: 0.9 }}
                                        animate={{ 
                                            scale: isLikeAnimating ? 1.25 : 1,
                                            transition: { 
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 10
                                            }
                                        }}
                                    >
                                        {isLiked ? (
                                            <motion.svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                viewBox="0 0 24 24" 
                                                fill="currentColor" 
                                                className="w-5 h-5 text-red-500"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 500 }}
                                            >
                                                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                            </motion.svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-600">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                            </svg>
                                        )}
                                    </motion.button>
                                </motion.div>
                                
                                {productImages.length > 1 && (
                                    <motion.div 
                                        className="grid grid-cols-4 gap-3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                    >
                            {productImages.map((image, index) => (
                                            <motion.button 
                                    key={index}
                                    onClick={() => setMainImage(image)}
                                                className={`
                                                    rounded-lg overflow-hidden border-2
                                                    ${mainImage === image ? 'border-[#F8BD19]' : 'border-transparent'}
                                                `}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 * index + 0.3 }}
                                >
                                    <OptimizedImage
                                        src={image}
                                                    alt={`${product.name} - Image ${index + 1}`}
                                                    className="w-full h-16 object-contain"
                                                    width={100}
                                                    height={100}
                                                />
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </AnimationWrapper>

                        <AnimationWrapper variants={slideInRight}>
                            <div className="flex flex-col gap-4">
                                <motion.h1 
                                    className="text-3xl font-medium text-text-primary"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {product.name}
                                </motion.h1>
                                
                                <motion.div 
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1, duration: 0.5 }}
                                >
                            <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Image
                                    key={index}
                                    className="h-4 w-4"
                                    src={
                                        index < Math.floor(4)
                                            ? assets.star_icon
                                            : assets.star_dull_icon
                                    }
                                    alt="star_icon"
                                />
                            ))}
                            </div>
                                    <span className="text-sm text-text-secondary">(4.5)</span>
                                </motion.div>
                                
                                <motion.div 
                                    className="flex items-center gap-4 mt-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                >
                                    <p className="text-2xl font-medium text-text-primary">
                                        ${product.offerPrice}
                                    </p>
                                    {product.price > product.offerPrice && (
                                        <p className="text-lg text-text-secondary line-through">
                                            ${product.price}
                                        </p>
                                    )}
                                    {discount > 0 && (
                                        <span className="text-sm text-green-600 font-medium">
                                            {discount}% off
                                        </span>
                                    )}
                                </motion.div>
                                
                                <motion.p 
                                    className="text-text-secondary mt-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                >
                                    {product.description}
                                </motion.p>
                                
                                <motion.div 
                                    className="h-0.5 bg-border-color w-full my-4"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                ></motion.div>
                                
                                <motion.div 
                                    className="grid grid-cols-2 gap-4 text-sm text-text-secondary"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium text-text-primary">Category</span>
                                        <span>{product.category || "Uncategorized"}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium text-text-primary">Availability</span>
                                <span className="text-green-600">In Stock</span>
                        </div>
                                </motion.div>
                                
                                <motion.div 
                                    className="flex gap-4 mt-8"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                >
                                    <motion.button
                                onClick={handleAddToCart}
                                        className="px-6 py-3 bg-background border border-[#F8BD19] text-[#F8BD19] rounded hover:bg-[#F8BD19]/10 transition"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                            >
                                Add to Cart
                                    </motion.button>
                                    <motion.button
                                onClick={handleBuyNow}
                                        className="px-6 py-3 bg-[#F8BD19] text-white rounded hover:bg-[#F8BD19]/90 transition"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                            >
                                Buy Now
                                    </motion.button>
                                </motion.div>
                        </div>
                        </AnimationWrapper>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <AnimationWrapper variants={slideUp} delay={0.7}>
                            <div className="mt-16">
                                <div className="flex flex-col items-center mb-8">
                                    <h2 className="text-2xl font-medium text-text-primary">Related Products</h2>
                                    <div className="w-24 h-0.5 bg-[#F8BD19] mt-2"></div>
                </div>

                                <StaggeredList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {relatedProducts.map((relatedProduct, index) => (
                                        relatedProduct ? 
                                            <ProductCard key={relatedProduct._id || index} product={relatedProduct} /> 
                                        : null
                                    ))}
                                </StaggeredList>
                    </div>
                        </AnimationWrapper>
                    )}
                </div>
            </PageTransition>
            <Footer />
        </>
    );
};

export default Product;