import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { FiMinus, FiPlus, FiShoppingCart, FiStar } from 'react-icons/fi';
import StarRatings from 'react-star-ratings';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';

import axiosInstance from '../api/axiosInstance.js';
import { addToCart } from '../features/cart/cartSlice.js';
import Spinner from '../components/common/Spinner.jsx';
import SmartRecommendations from '../components/ai/SmartRecommendations.jsx';

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
      <div className="min-h-[70vh] flex justify-center items-center">
        <Spinner className="h-12 w-12 text-primary-600" />
      </div>
    );
  }

  if (isError || !productData) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
        <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/products')} className="btn-primary px-6 py-2">
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
    <div className="bg-white min-h-screen py-8">
      <Helmet>
        <title>{productData.name} | Ecom.</title>
      </Helmet>

      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button onClick={() => navigate('/')} className="hover:text-primary-600 transition-colors">Home</button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-300">/</span>
                <button onClick={() => navigate('/products')} className="hover:text-primary-600 transition-colors">Products</button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-300">/</span>
                <button 
                  onClick={() => navigate(`/products?category=${productData.category}`)} 
                  className="hover:text-primary-600 transition-colors"
                >
                  {productData.category}
                </button>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-300">/</span>
                <span className="text-gray-900 font-medium truncate max-w-[200px]">{productData.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 mb-8 lg:mb-0">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] p-1 snap-x">
              {productData.images.map((image, index) => (
                <button
                  key={image.public_id || index}
                  onClick={() => setActiveImage(index)}
                  className={`
                    relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all snap-start
                    ${activeImage === index ? 'border-primary-600 shadow-sm' : 'border-transparent hover:border-primary-300'}
                  `}
                >
                  <img src={image.url} alt={`${productData.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Image with Zoom */}
            <div className="aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-1 relative">
              {productData.images[activeImage] ? (
                <InnerImageZoom
                  src={productData.images[activeImage].url}
                  zoomSrc={productData.images[activeImage].url}
                  alt={productData.name}
                  className="w-full h-full object-cover"
                  zoomType="hover"
                  hideHint={true}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
              
              {hasDiscount && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                  Sale -{Math.round(((productData.price - productData.discountPrice) / productData.price) * 100)}%
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              {productData.name}
            </h1>
            
            <p className="text-lg text-primary-600 font-medium mb-4">{productData.brand}</p>

            {/* Ratings */}
            <div className="flex items-center mb-6">
              <StarRatings
                rating={productData.ratings}
                starRatedColor="#fbbf24"
                starEmptyColor="#e5e7eb"
                starDimension="20px"
                starSpacing="2px"
              />
              <span className="ml-3 text-sm font-medium text-gray-600">
                {productData.ratings.toFixed(1)} ({productData.numOfReviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-4xl font-extrabold text-gray-900">₹{currentPrice}</span>
              {hasDiscount && (
                <span className="text-xl font-medium text-gray-400 line-through">₹{productData.price}</span>
              )}
            </div>

            <p className="text-gray-600 text-base leading-relaxed mb-8 whitespace-pre-line">
              {productData.description}
            </p>

            {/* Action Area */}
            <div className="border-t border-gray-200 py-8 mb-8 space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  productData.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {productData.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {productData.stock > 0 && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-gray-300 rounded-lg w-fit bg-white">
                    <button 
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 focus:outline-none transition-colors"
                    >
                      <FiMinus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
                    <button 
                      type="button"
                      onClick={() => setQuantity(Math.min(productData.stock, quantity + 1))}
                      className="p-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 focus:outline-none transition-colors"
                    >
                      <FiPlus className="h-4 w-4" />
                    </button>
                  </div>

                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 btn-primary py-3 px-8 text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30"
                  >
                    <FiShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-auto">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Tags:</span>
                {productData.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Smart Recommendations Module */}
        <div className="mt-24 border-t border-gray-200 pt-16">
          <SmartRecommendations currentProductId={productData._id} />
        </div>

        {/* Reviews Section */}
        <div className="mt-24 border-t border-gray-200 pt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
          
          {!reviewsData || reviewsData.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-4xl mb-3">⭐</div>
              <p className="text-gray-500 font-medium">No reviews yet for this product.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {reviewsData.map((review) => (
                <div key={review._id} className="border-b border-gray-100 pb-8 last:border-0">
                  <div className="flex items-center gap-4 mb-4">
                    {review.user?.avatar ? (
                      <img src={review.user.avatar} alt={review.user.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                        {review.user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.user?.name || 'Anonymous User'}</h4>
                      <div className="flex items-center gap-2">
                        <StarRatings
                          rating={review.rating}
                          starRatedColor="#fbbf24"
                          starDimension="14px"
                          starSpacing="1px"
                        />
                        <span className="text-xs text-gray-400 font-medium">
                          {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {review.comment}
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
