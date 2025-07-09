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
    const { products, router, addToCart, isLoading: globalLoading, isInWishlist, toggleWishlist } = useAppContext();
    
    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [productImages, setProductImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [structuredData, setStructuredData] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isLikeAnimating, setIsLikeAnimating] = useState(false);

    const fetchProductData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const product = products.find(product => product && product._id === id);
        
        if (product) {
            setProductData(product);
                
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
            } else {
                setError("Product not found");
                Toast.showError("Product not found");
            }
        } catch (err) {
            console.error("Error fetching product:", err);
            setError("Failed to load product");
            Toast.showError("Failed to load product");
        } finally {
            setIsLoading(false);
        }
    }

    const handleAddToCart = () => {
        addToCart(productData._id);
        Toast.showSuccess("Added to cart");
    };

    const handleBuyNow = () => {
        addToCart(productData._id);
        router.push('/cart');
    };
    
    const handleToggleWishlist = async () => {
        // Start animation
        setIsLikeAnimating(true);
        
        // Toggle wishlist status
        const result = await toggleWishlist(productData._id);
        
        // Update local state if we got a valid result
        if (result !== null) {
            setIsLiked(result);
        }
        
        // End animation after a short delay
        setTimeout(() => {
            setIsLikeAnimating(false);
        }, 500);
    };

    useEffect(() => {
        fetchProductData();
    }, [id, products]);
    
    // Update liked status when wishlist changes
    useEffect(() => {
        if (productData) {
            setIsLiked(isInWishlist(productData._id));
        }
    }, [isInWishlist, productData]);

    // Calculate page title and meta description for SEO
    const pageTitle = productData 
        ? `${productData.name} | ${productData.category || 'Product'}`
        : 'Product Details';
        
    const pageDescription = productData
        ? `${productData.description?.substring(0, 150)}...`
        : 'View product details, specifications, and pricing.';

    if (globalLoading || isLoading) return (
        <>
            <Navbar />
            <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
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
    
    if (error) return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 md:px-16 lg:px-32">
                <h1 className="text-2xl font-medium text-gray-800 mb-4">{error}</h1>
                <p className="text-gray-500 mb-6">We couldn't find the product you're looking for.</p>
                <button 
                    onClick={() => router.push('/all-products')}
                    className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                >
                    View All Products
                </button>
            </div>
            <Footer />
        </>
    );
    
    if (!productData) return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 md:px-16 lg:px-32">
                <h1 className="text-2xl font-medium text-gray-800 mb-4">Product Not Found</h1>
                <p className="text-gray-500 mb-6">We couldn't find the product you're looking for.</p>
                <button 
                    onClick={() => router.push('/all-products')}
                    className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
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
    const discount = productData.price && productData.offerPrice 
        ? Math.round(((productData.price - productData.offerPrice) / productData.price) * 100) 
        : 0;

    return (
        <>
            {structuredData && (
                <Script id="product-schema" type="application/ld+json" 
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            )}
            
            <Navbar />
            <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
                {/* Breadcrumb */}
                <Breadcrumb 
                    items={[
                        { label: 'Shop', path: '/all-products' }
                    ]} 
                    currentPage={productData.name}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="px-5 lg:px-16 xl:px-20">
                        <div className="rounded-lg overflow-hidden mb-4 relative">
                            {discount > 0 && (
                                <div className="absolute top-4 left-4 bg-orange-500 text-white text-sm px-3 py-1 rounded z-10">
                                    -{discount}% OFF
                                </div>
                            )}
                            <OptimizedImage
                                src={mainImage || productImages[0]}
                                alt={productData.name || "Product"}
                                className="w-full h-auto"
                                width={1280}
                                height={720}
                                priority
                                objectFit="contain"
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {productImages.map((image, index) => (
                                <div
                                    key={index}
                                    onClick={() => setMainImage(image)}
                                    className={`cursor-pointer rounded-lg overflow-hidden ${mainImage === image ? 'ring-2 ring-orange-500' : ''}`}
                                >
                                    <OptimizedImage
                                        src={image}
                                        alt={`Product view ${index + 1}`}
                                        className="w-full h-auto"
                                        width={300}
                                        height={300}
                                        objectFit="contain"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-medium">{productData.name}</h1>
                                <p className="text-gray-500 mt-1">{productData.category}</p>
                            </div>
                            <button 
                                onClick={handleToggleWishlist}
                                className={`p-3 rounded-full hover:bg-gray-100 transition ${isLikeAnimating ? 'scale-125' : ''} transform duration-300`}
                            >
                                <Image
                                    className={`h-5 w-5 transition-all duration-300 ${isLiked ? 'filter-none' : 'grayscale opacity-60'}`}
                                    src={isLiked ? '/heart-filled.svg' : assets.heart_icon}
                                    alt="heart_icon"
                                    width={20}
                                    height={20}
                                />
                            </button>
                        </div>

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
                            <span className="text-sm text-gray-500 ml-1">(4.5)</span>
                            </div>

                        <p className="text-gray-600 leading-relaxed">{productData.description}</p>

                        <div className="flex items-end gap-4">
                            <p className="text-2xl font-medium">{process.env.NEXT_PUBLIC_CURRENCY}{productData.offerPrice}</p>
                            {productData.price > productData.offerPrice && (
                                <>
                                    <p className="text-gray-500 line-through">{process.env.NEXT_PUBLIC_CURRENCY}{productData.price}</p>
                                    <p className="text-green-600 text-sm">Save {process.env.NEXT_PUBLIC_CURRENCY}{(productData.price - productData.offerPrice).toFixed(2)}</p>
                                </>
                            )}
                        </div>

                        <div className="h-0.5 bg-gray-200 w-full"></div>

                        <div className="space-y-4">
                            <p className="flex justify-between">
                                <span className="text-gray-600">Availability</span>
                                <span className="text-green-600">In Stock</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-600">Category</span>
                                <span>{productData.category || "Uncategorized"}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-600">SKU</span>
                                <span>{productData._id?.substring(0, 8) || "Unknown"}</span>
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleAddToCart}
                                className="px-8 py-3 border border-gray-300 rounded hover:bg-gray-50 transition flex-1 md:flex-none"
                            >
                                Add to Cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="px-8 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 transition flex-1 md:flex-none"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-8 py-10">
                    <h2 className="text-2xl font-medium">Related Products</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {products
                            .filter(
                                (product) =>
                                    product &&
                                    product._id !== id &&
                                    product.category === productData.category
                            )
                            .slice(0, 5)
                            .map((product, index) => (
                                <ProductCard key={index} product={product} />
                            ))}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Product;