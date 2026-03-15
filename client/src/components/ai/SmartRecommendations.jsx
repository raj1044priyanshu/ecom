import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination } from 'swiper/modules';
import { TrendingUp } from 'lucide-react';
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
    <div className="w-full mt-16 pt-16 border-t border-surface-300">
      <div className="flex flex-col items-center text-center gap-3 mb-12">
        <div className="bg-primary-100 p-3 rounded-2xl text-primary-600 shadow-sm border border-primary-200 mb-2">
          <TrendingUp className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            You May Also Like
          </h2>
          <p className="text-sm font-semibold text-gray-700 mt-2 max-w-md mx-auto">
            {isAuthenticated ? 'Handpicked for you based on your preferences' : 'Frequently bought together with this item'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
              1024: { slidesPerView: 4, spaceBetween: 32 },
            }}
            modules={[FreeMode, Pagination]}
            className="pb-16" // Space for pagination dots
          >
            {data.recommendations.map((product) => (
              <SwiperSlide key={product._id} className="h-auto pb-4">
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
