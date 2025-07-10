import React from 'react'
import { useTheme } from '@/context/ThemeContext';

const SpinnerLoader = () => (
  <div className="flex justify-center items-center h-[70vh]">
    <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-orange-500 border-border-color"></div>
  </div>
);

export const ProductCardSkeleton = () => {
  const { theme } = useTheme();
  const bgColor = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';
  
    return (
    <div className="flex flex-col items-start gap-0.5 max-w-[220px] w-full animate-pulse">
      <div className={`${bgColor} rounded-lg w-full h-60 flex items-center justify-center transition-colors duration-200`}></div>
      <div className="w-full pt-3">
        <div className="flex items-center gap-0.5 mb-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={`h-3 w-3 ${bgColor} rounded-full transition-colors duration-200`}></div>
          ))}
        </div>
        <div className={`h-4 ${bgColor} w-24 mb-1 rounded transition-colors duration-200`}></div>
        <div className={`h-5 ${bgColor} w-full mb-2 rounded transition-colors duration-200`}></div>
        <div className={`h-4 ${bgColor} w-3/4 mb-2 rounded transition-colors duration-200`}></div>
        <div className={`h-5 ${bgColor} w-20 mt-2 rounded transition-colors duration-200`}></div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

export const TextSkeleton = ({ width = "w-full", height = "h-4" }) => {
  const { theme } = useTheme();
  const bgColor = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';
  
  return (
    <div className={`${width} ${height} ${bgColor} rounded animate-pulse transition-colors duration-200`}></div>
  );
};

export const ImageSkeleton = ({ className = "w-full h-60" }) => {
  const { theme } = useTheme();
  const bgColor = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';
  
  return (
    <div className={`${className} ${bgColor} rounded animate-pulse transition-colors duration-200`}></div>
  );
};

const Loading = ({ variant = "spinner", count = 8 }) => {
  switch (variant) {
    case "products":
      return <ProductGridSkeleton count={count} />;
    case "product-card":
      return <ProductCardSkeleton />;
    case "text":
      return <TextSkeleton />;
    case "image":
      return <ImageSkeleton />;
    case "spinner":
    default:
      return <SpinnerLoader />;
  }
};

export default Loading;