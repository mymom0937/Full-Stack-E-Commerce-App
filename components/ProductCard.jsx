import React, { useState, useEffect } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import OptimizedImage from './OptimizedImage';

const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isLikeAnimating, setIsLikeAnimating] = useState(false);
    
    if (!product) return null;
    
    const { currency, router, addToCart, isInWishlist, toggleWishlist } = useAppContext();
    
    // Check if product is in wishlist on component mount
    useEffect(() => {
        setIsLiked(isInWishlist(product._id));
    }, [isInWishlist, product._id]);
    
    // Handle different image formats (array, single string, or undefined)
    let productImage = '/placeholder-image.png';
    if (product.image) {
        // Handle if product.image is an array
        if (Array.isArray(product.image) && product.image.length > 0) {
            productImage = product.image[0];
        } 
        // Handle if product.image is a string
        else if (typeof product.image === 'string') {
            productImage = product.image;
        }
    } 
    // Handle if the field is called images instead of image
    else if (product.images) {
        if (Array.isArray(product.images) && product.images.length > 0) {
            productImage = product.images[0];
        }
        else if (typeof product.images === 'string') {
            productImage = product.images;
        }
    }
    
    // Calculate discount percentage
    const discount = product.price && product.offerPrice 
        ? Math.round(((product.price - product.offerPrice) / product.price) * 100) 
        : 0;

    const handleQuickView = (e) => {
        e.stopPropagation();
        router.push('/product/' + product._id);
        scrollTo(0, 0);
    };
    
    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product._id);
    };
    
    const handleToggleWishlist = async (e) => {
        e.stopPropagation();
        
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

    return (
        <div
            onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0) }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex flex-col items-start gap-0.5 max-w-[220px] w-full cursor-pointer group"
        >
            <div className="relative rounded-lg w-full h-60 flex items-center justify-center overflow-hidden bg-card-bg transition-colors duration-200">
                {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded z-10">
                        -{discount}%
                    </div>
                )}
                
                <OptimizedImage
                    src={productImage}
                    alt={product.name || "Product"}
                    className={`transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}
                    width={800}
                    height={800}
                    objectFit="contain"
                />
                
                <div className={`absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={handleQuickView}
                            className="bg-background text-text-primary px-4 py-2 text-sm rounded hover:bg-card-bg transition-colors duration-200"
                        >
                            Quick View
                        </button>
                        <button 
                            onClick={handleAddToCart}
                            className="bg-orange-500 text-white px-4 py-2 text-sm rounded hover:bg-orange-600 transition"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
                
                <button 
                    onClick={handleToggleWishlist}
                    className={`absolute top-2 right-2 bg-background p-2 rounded-full shadow-md hover:bg-card-bg transition-colors duration-200 ${isLikeAnimating ? 'scale-125' : ''} transform duration-300`}
                >
                    <Image
                        className={`h-3 w-3 transition-all duration-300 ${isLiked ? 'filter-none' : 'grayscale opacity-60'}`}
                        src={isLiked ? '/heart-filled.svg' : assets.heart_icon}
                        alt="heart_icon"
                        width={12}
                        height={12}
                    />
                </button>
            </div>

            <div className="w-full pt-3">
                <div className="flex items-center gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Image
                            key={index}
                            className="h-3 w-3"
                            src={
                                index < Math.floor(4)
                                    ? assets.star_icon
                                    : assets.star_dull_icon
                            }
                            alt="star_icon"
                        />
                    ))}
                    <span className="text-xs text-text-secondary ml-1">(4.5)</span>
                </div>
                
                <p className="text-sm text-text-secondary mb-1">{product.category || "Category"}</p>
                <p className="font-medium text-text-primary truncate">{product.name || "Product"}</p>
                <p className="text-sm text-text-secondary max-sm:hidden truncate">{product.description?.substring(0, 60) || ""}</p>
                
                <div className="flex items-center gap-2 mt-2">
                    <p className="font-medium text-text-primary">{currency}{product.offerPrice || 0}</p>
                    {product.price > product.offerPrice && (
                        <p className="text-sm text-text-secondary line-through">{currency}{product.price || 0}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductCard