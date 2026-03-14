import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination } from 'swiper/modules';
import { FiTrendingUp } from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance.js';
import ProductCard from '../product/ProductCard.jsx';
import SkeletonCard from '../common/SkeletonCard.jsx';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

const SmartRecommendations = ({ currentProductId }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ai-recommendations', currentProductId],
    queryFn: async () => {
      // Determine endpoint based on context
      const endpoint = currentProductId 
        ? `/ai/recommendations?productId=${currentProductId}`
        : '/ai/recommendations';

      // Always send request. If anonymous, backend simply uses product context.
      // If user is authenticated, backend uses product + user history.
      const res = await axiosInstance.get(endpoint);
      return res.data;
    },
    // Only refetch if product changes, or cache expires
    staleTime: 5 * 60 * 1000, 
    retry: 1
  });

  if (isError || (!isLoading && (!data?.recommendations || data.recommendations.length === 0))) {
    return null; // Don't show the section if Smart fails or returns empty
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-primary-600 p-2 rounded-lg text-white shadow-md">
          <FiTrendingUp className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            You May Also Like
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAuthenticated ? 'Handpicked for you based on your preferences' : 'Frequently bought together'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <Swiper
            slidesPerView={1.5}
            spaceBetween={16}
            freeMode={true}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            breakpoints={{
              640: { slidesPerView: 2.5, spaceBetween: 20 },
              768: { slidesPerView: 3, spaceBetween: 24 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
            }}
            modules={[FreeMode, Pagination]}
            className="pb-12" // Space for pagination dots
          >
            {data.recommendations.map((product) => (
              <SwiperSlide key={product._id} className="h-auto">
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
};

export default SmartRecommendations;
