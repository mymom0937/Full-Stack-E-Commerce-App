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
import toast from "react-hot-toast";
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
    const { products, router, addToCart, isLoading: globalLoading } = useAppContext();
    
    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [productImages, setProductImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [structuredData, setStructuredData] = useState(null);

    const fetchProductData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const product = products.find(product => product && product._id === id);
            
            if (product) {
                setProductData(product);
                
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
                toast.error("Product not found");
            }
        } catch (err) {
            console.error("Error fetching product:", err);
            setError("Failed to load product");
            toast.error("Failed to load product");
        } finally {
            setIsLoading(false);
        }
    }

    const handleAddToCart = () => {
        addToCart(productData._id);
        toast.success("Added to cart");
    };

    const handleBuyNow = () => {
        addToCart(productData._id);
        router.push('/cart');
    };

    useEffect(() => {
        fetchProductData();
    }, [id, products])

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

                    <div className="flex flex-col">
                        <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
                            {productData.name}
                        </h1>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                                <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                                <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                                <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                                <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                                <Image
                                    className="h-4 w-4"
                                    src={assets.star_dull_icon}
                                    alt="star_dull_icon"
                                />
                            </div>
                            <p className="text-gray-500">(4.5)</p>
                        </div>

                        <div className="flex items-center gap-3 mt-6">
                            <p className="text-3xl font-medium text-gray-800">
                                ${productData.offerPrice}
                            </p>
                            {productData.price > productData.offerPrice && (
                                <p className="text-xl font-normal text-gray-500 line-through">
                                    ${productData.price}
                                </p>
                            )}
                            {discount > 0 && (
                                <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded">
                                    {discount}% off
                                </span>
                            )}
                        </div>

                        <p className="text-gray-600 mt-6 leading-relaxed">
                            {productData.description}
                        </p>

                        <hr className="bg-gray-300 my-6" />
                        
                        <div className="overflow-x-auto mb-6">
                            <table className="table-auto border-collapse w-full max-w-md">
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 text-gray-600 font-medium">Category</td>
                                        <td className="py-2 text-gray-800">
                                            {productData.category || "Uncategorized"}
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 text-gray-600 font-medium">Brand</td>
                                        <td className="py-2 text-gray-800">Generic</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-600 font-medium">Availability</td>
                                        <td className="py-2 text-green-600">In Stock</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center gap-4 mt-6">
                            <button 
                                onClick={handleAddToCart} 
                                className="flex-1 py-3.5 bg-gray-100 text-gray-800 hover:bg-gray-200 transition rounded-md"
                            >
                                Add to Cart
                            </button>
                            <button 
                                onClick={handleBuyNow} 
                                className="flex-1 py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition rounded-md"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center mt-16">
                    <div className="flex flex-col items-center mb-8">
                        <p className="text-3xl font-medium">Similar <span className="font-medium text-orange-600">Products</span></p>
                        <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
                    </div>
                    
                    {globalLoading ? (
                        <Loading variant="products" count={5} />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full pb-14">
                            {products && products.length > 0 ? 
                                products
                                    .filter(p => p && p._id !== id && p.category === productData.category)
                                    .slice(0, 5)
                                    .map((product, index) => product ? <ProductCard key={product._id || index} product={product} /> : null)
                                : null
                            }
                            
                            {products && products.filter(p => p && p._id !== id && p.category === productData.category).length === 0 && 
                                products.filter(p => p && p._id !== id).slice(0, 5).map((product, index) => 
                                    product ? <ProductCard key={product._id || index} product={product} /> : null
                                )
                            }
                        </div>
                    )}
                    
                    <button onClick={() => router.push('/all-products')} className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
                        See more
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Product;