import React from 'react'

const SpinnerLoader = () => (
  <div className="flex justify-center items-center h-[70vh]">
    <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-orange-500 border-gray-200"></div>
  </div>
);

export const ProductCardSkeleton = () => (
  <div className="flex flex-col items-start gap-0.5 max-w-[220px] w-full animate-pulse">
    <div className="bg-gray-200 rounded-lg w-full h-60 flex items-center justify-center"></div>
    <div className="w-full pt-3">
      <div className="flex items-center gap-0.5 mb-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-3 w-3 bg-gray-200 rounded-full"></div>
        ))}
      </div>
      <div className="h-4 bg-gray-200 w-24 mb-1 rounded"></div>
      <div className="h-5 bg-gray-200 w-full mb-2 rounded"></div>
      <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded"></div>
      <div className="h-5 bg-gray-200 w-20 mt-2 rounded"></div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

export const TextSkeleton = ({ width = "w-full", height = "h-4" }) => (
  <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`}></div>
);

export const ImageSkeleton = ({ className = "w-full h-60" }) => (
  <div className={`${className} bg-gray-200 rounded animate-pulse`}></div>
);

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