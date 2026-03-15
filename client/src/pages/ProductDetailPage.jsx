import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { Minus, Plus, ShoppingCart, Star, StarHalf } from 'lucide-react';
import StarRatings from 'react-star-ratings';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';

import axiosInstance from '../api/axiosInstance.js';
import { addToCart } from '../features/cart/cartSlice.js';
import Spinner from '../components/common/Spinner.jsx';
import SmartRecommendations from '../components/ai/SmartRecommendations.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Scroll to top on mount or when slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Fetch product details
  const { data: productData, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await axiosInstance.get(`/products/${slug}`);
      return res.data.product;
    },
  });

  // Fetch product reviews
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', productData?._id],
    queryFn: async () => {
      if (!productData?._id) return null;
      const res = await axiosInstance.get(`/products/${productData._id}/reviews`);
      return res.data.reviews;
    },
    enabled: !!productData?._id,
  });

  if (isLoading) {
    return (
      <div className="section-cream min-h-[70vh] flex justify-center items-center">
        <Spinner className="h-12 w-12 text-primary-600" />
      </div>
    );
  }

  if (isError || !productData) {
    return (
      <div className="section-cream min-h-[70vh] flex flex-col justify-center items-center text-center px-4">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Product not found</h2>
        <p className="text-gray-700 font-medium mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/products')} className="btn-primary px-8 py-3 shadow-lg shadow-primary-500/20">
          Back to Products
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart({ productId: productData._id, quantity }));
  };

  const currentPrice = productData.discountPrice || productData.price;
  const hasDiscount = productData.discountPrice > 0;

  return (
    <div className="section-cream min-h-screen py-8 pb-20">
      <Helmet>
        <title>{productData.name} | Ecom.</title>
      </Helmet>

      <div className="container-custom max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex text-sm font-bold text-gray-700 mb-8 border-b-2 border-primary-500 inline-block w-fit py-1" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button onClick={() => navigate('/')} className="hover:text-primary-600 transition-colors uppercase tracking-widest text-xs">Home</button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-surface-300">/</span>
                <button onClick={() => navigate('/products')} className="hover:text-primary-600 transition-colors uppercase tracking-widest text-xs">Products</button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-surface-300">/</span>
                <button 
                  onClick={() => navigate(`/products?category=${productData.category}`)} 
                  className="hover:text-primary-600 transition-colors uppercase tracking-widest text-xs"
                >
                  {productData.category}
                </button>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-surface-300">/</span>
                <span className="text-gray-900 font-black truncate max-w-[200px] text-xs uppercase tracking-widest">{productData.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-20">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-5 lg:gap-8 mb-10 lg:mb-0">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:max-h-[700px] p-2 snap-x custom-scrollbar">
              {productData.images.map((image, index) => (
                <button
                  key={image.public_id || index}
                  onClick={() => setActiveImage(index)}
                  className={`
                    relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden border-[3px] transition-all snap-start
                    ${activeImage === index ? 'border-primary-600 shadow-md shadow-primary-500/20' : 'border-surface-300 hover:border-primary-400 bg-white opacity-80 hover:opacity-100'}
                  `}
                >
                  <img src={image.url} alt={`${productData.name} ${index + 1}`} className="w-full h-full object-contain p-2" />
                </button>
              ))}
            </div>

            {/* Main Image with Zoom */}
            <div className="w-full h-fit bg-white rounded-[2rem] overflow-hidden border-2 border-surface-300 flex-1 relative shadow-xl shadow-surface-200/50">
              {productData.images[activeImage] ? (
                <InnerImageZoom
                  src={productData.images[activeImage].url}
                  zoomSrc={productData.images[activeImage].url}
                  alt={productData.name}
                  className="w-full h-auto object-contain"
                  zoomType="hover"
                  hideHint={true}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold bg-surface-50">No Image Available</div>
              )}
              
              {hasDiscount && (
                <div className="absolute top-6 left-6 z-10 bg-amber-500 text-gray-900 px-4 py-1.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-md shadow-amber-500/30">
                  Sale -{Math.round(((productData.price - productData.discountPrice) / productData.price) * 100)}%
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <p className="text-sm font-black text-primary-600 uppercase tracking-[0.2em] mb-3 inline-block bg-primary-50 px-3 py-1 rounded-xl w-fit border border-primary-100">{productData.brand}</p>
            
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4 leading-tight">
              {productData.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center mb-8 pb-6 border-b border-surface-300">
              <StarRatings
                rating={productData.ratings}
                starRatedColor="#f59e0b" // amber-500
                starEmptyColor="#e7e5e4" // surface-200
                starDimension="22px"
                starSpacing="3px"
              />
              <span className="ml-4 text-sm font-bold text-gray-700 bg-surface-100 px-2.5 py-1 rounded-lg">
                <span className="text-gray-900">{productData.ratings.toFixed(1)}</span> ({productData.numOfReviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-5 mb-8">
              <span className="text-5xl font-black text-gray-900 tracking-tight">{formatCurrency(currentPrice)}</span>
              {hasDiscount && (
                <span className="text-2xl font-bold text-gray-600 line-through mb-1">{formatCurrency(productData.price)}</span>
              )}
            </div>

            <p className="text-gray-800 text-base lg:text-lg font-medium leading-relaxed mb-10 whitespace-pre-line bg-white p-6 rounded-3xl border border-surface-300 shadow-sm">
              {productData.description}
            </p>

            {/* Action Area */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border-2 border-surface-300 shadow-xl shadow-surface-200/40 space-y-8 mb-10">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-black text-gray-700 uppercase tracking-widest">Availability</span>
                <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border ${
                  productData.stock > 0 ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {productData.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {productData.stock > 0 && (
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Quantity selector */}
                  <div className="flex items-center border-[3px] border-surface-300 rounded-2xl w-fit bg-surface-50 transition-colors focus-within:border-primary-400 overflow-hidden">
                    <button 
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-4 text-gray-700 hover:text-primary-600 hover:bg-white focus:outline-none transition-colors border-r border-surface-300 bg-surface-100"
                    >
                      <Minus className="h-5 w-5" strokeWidth={3} />
                    </button>
                    <span className="w-16 text-center font-black text-gray-900 text-lg">{quantity}</span>
                    <button 
                      type="button"
                      onClick={() => setQuantity(Math.min(productData.stock, quantity + 1))}
                      className="p-4 text-gray-700 hover:text-primary-600 hover:bg-white focus:outline-none transition-colors border-l border-surface-300 bg-surface-100"
                    >
                      <Plus className="h-5 w-5" strokeWidth={3} />
                    </button>
                  </div>

                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 btn-primary py-4 px-8 text-lg font-black tracking-wide flex items-center justify-center gap-3 shadow-xl shadow-primary-500/30 w-full sm:w-auto"
                  >
                    <ShoppingCart className="h-6 w-6" strokeWidth={2.5} />
                    Add to Cart
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-auto">
              <div className="flex flex-wrap items-center gap-3 pb-4">
                <span className="text-xs font-black text-gray-600 uppercase tracking-widest mr-2">Tags</span>
                {productData.tags.map(tag => (
                  <span key={tag} className="bg-white border text-gray-800 border-surface-300 px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:border-surface-300 transition-colors cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Smart Recommendations Module */}
        <div className="mt-28">
          <h3 className="text-3xl font-black text-gray-900 mb-10 tracking-tight flex items-center gap-3">
            <span className="bg-amber-100 text-amber-600 p-2 rounded-xl border border-amber-200">
              <Star className="h-6 w-6" strokeWidth={2.5} />
            </span>
            You Might Also Like
          </h3>
          <SmartRecommendations currentProductId={productData._id} />
        </div>

        {/* Reviews Section */}
        <div className="mt-28 max-w-5xl">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Customer Reviews</h2>
            <div className="bg-gray-900 text-white px-3 py-1 rounded-xl text-sm font-bold shadow-md">
              {reviewsData?.length || 0}
            </div>
          </div>
          
          {!reviewsData || reviewsData.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-surface-300 border-dashed">
              <div className="w-16 h-16 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-surface-300">
                <Star className="h-8 w-8 text-surface-300" strokeWidth={2} />
              </div>
              <p className="text-lg font-bold text-gray-900">No reviews yet</p>
              <p className="text-gray-700 font-medium">Be the first to share your thoughts on this product.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviewsData.map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-[2rem] border border-surface-300 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-5">
                    {review.user?.avatar ? (
                      <img src={review.user.avatar} alt={review.user.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-surface-300" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black shadow-sm border border-primary-200">
                        {review.user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-black text-gray-900 leading-tight">{review.user?.name || 'Anonymous User'}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRatings
                          rating={review.rating}
                          starRatedColor="#f59e0b"
                          starDimension="14px"
                          starSpacing="1px"
                        />
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest ml-2">
                          {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-800 font-medium leading-relaxed bg-surface-50 p-5 rounded-[1.5rem] border border-surface-300">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
