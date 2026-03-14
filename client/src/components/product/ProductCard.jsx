import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiEye } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice.js';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  
  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigating to product detail
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  const discount = product.price > 0 && product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="card h-full flex flex-col hover:shadow-md transition-shadow duration-300 relative bg-white">
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-t-xl group-hover:opacity-90 transition-opacity">
          <img
            src={product.images[0]?.url || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* Quick actions overlay (desktop) */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="btn bg-white text-gray-900 hover:bg-primary-50 px-4 py-2 text-sm shadow-sm flex-1 flex justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingCart className="mr-2 h-4 w-4" />
              {product.stock > 0 ? 'Add' : 'Out of Stock'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">
            {product.category}
          </div>
          
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center mb-3 mt-auto">
            <div className="flex items-center text-yellow-400">
              <FiStar className="fill-current h-4 w-4" />
              <span className="ml-1 text-sm font-medium text-gray-700">{product.ratings.toFixed(1)}</span>
            </div>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-xs text-gray-500">{product.numOfReviews} reviews</span>
          </div>
          
          <div className="flex items-end justify-between mt-1">
            <div className="flex gap-2 items-baseline">
              <span className="text-lg font-bold text-gray-900">
                ₹{product.discountPrice || product.price}
              </span>
              {product.discountPrice > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.price}
                </span>
              )}
            </div>
            
            {/* Quick add mobile */}
            <button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="md:hidden bg-primary-50 text-primary-600 p-2 rounded-full hover:bg-primary-100 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <FiShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
