import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonCard = () => {
  return (
    <div className="card h-full flex flex-col p-4 bg-white border border-gray-100 placeholder-wave">
      <div className="aspect-square mb-4 overflow-hidden rounded-xl">
        <Skeleton height="100%" className="rounded-xl" />
      </div>
      <div className="flex flex-col flex-grow">
        <Skeleton width="40%" height={12} className="mb-2" />
        <Skeleton count={2} height={16} className="mb-3" />
        <div className="mt-auto flex justify-between items-end">
          <Skeleton width={60} height={24} />
          <Skeleton circle={true} width={36} height={36} />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
