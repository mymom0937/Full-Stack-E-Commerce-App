'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  width = 800, 
  height = 800,
  priority = false,
  quality = 75,
  objectFit = "contain",
  background = "bg-gray-100"
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState('/placeholder-image.png');
  
  useEffect(() => {
    if (src) {
      setImageSrc(src);
    }
  }, [src]);
  
  const handleLoad = () => {
    setLoaded(true);
  };
  
  const handleError = () => {
    setError(true);
    setImageSrc('/placeholder-image.png');
  };
  
  return (
    <div className={`relative ${background} overflow-hidden ${className || ''}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={imageSrc}
        alt={alt || "Product image"}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ objectFit }}
      />
    </div>
  );
};

export default OptimizedImage; 