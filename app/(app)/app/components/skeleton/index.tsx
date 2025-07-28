import React from 'react';

// Base skeleton component
const Skeleton = ({ className = "", width = "100%", height = "20px" }: {
  className?: string;
  width?: string;
  height?: string;
}) => (
  <div 
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    style={{ width, height }}
  />
);

// Product skeleton for product cards
export const ProductSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
    <Skeleton height="150px" className="rounded-lg" />
    <Skeleton height="20px" width="80%" />
    <Skeleton height="16px" width="60%" />
    <div className="flex justify-between items-center">
      <Skeleton height="24px" width="40%" />
      <Skeleton height="20px" width="30%" />
    </div>
  </div>
);

// Nutrient skeleton for nutrition information
export const NutrientSkeleton = () => (
  <div className="space-y-4">
    <Skeleton height="24px" width="50%" />
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <Skeleton height="18px" width="40%" />
          <Skeleton height="18px" width="20%" />
        </div>
      ))}
    </div>
  </div>
);

// Additives skeleton for additives information
export const AdditivesSkeleton = () => (
  <div className="space-y-3">
    <Skeleton height="20px" width="60%" />
    <div className="flex flex-wrap gap-2">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} height="28px" width="80px" className="rounded-full" />
      ))}
    </div>
  </div>
);

export default Skeleton;
