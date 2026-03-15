import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice.js';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  const discount = product.price > 0 && product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Link to={`/products/${product.slug}`} className="group block relative">
      <div className="card-hover flex flex-col h-full bg-white">

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {discount > 0 && (
            <span className="badge-red shadow-sm bg-red-100 text-red-700">
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="badge-green shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-surface-100 p-2">
          <div className="w-full h-full rounded-2xl overflow-hidden relative bg-white">
            <img
              src={product.images[0]?.url || 'https://placehold.co/400x400?text=No+Image'}
              alt={product.name}
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>

          {/* Quick add overlay (desktop) */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex justify-center bg-gradient-to-t from-black/50 to-transparent">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full btn-primary py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold disabled:opacity-50 shadow-md"
            >
              <ShoppingCart className="h-4 w-4" strokeWidth={2.5} />
              {product.stock > 0 ? 'Quick Add' : 'Out of Stock'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="text-[10px] text-gray-600 mb-1.5 uppercase tracking-widest font-bold">
            {product.category}
          </div>

          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-auto group-hover:text-primary-600 transition-colors leading-snug">
            {product.name}
          </h3>

          <div className="flex items-center mt-2.5 mb-3.5">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-accent-400 stroke-accent-400" />
              <span className="text-xs font-bold text-gray-800">{product.ratings.toFixed(1)}</span>
            </div>
            <span className="mx-2 text-gray-200">|</span>
            <span className="text-xs font-medium text-gray-700">{product.numOfReviews} sold</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 items-baseline">
              <span className="text-lg font-black text-gray-900 tracking-tight">
                ₹{product.discountPrice || product.price}
              </span>
              {product.discountPrice > 0 && (
                <span className="text-xs font-medium text-gray-600 line-through">
                  ₹{product.price}
                </span>
              )}
            </div>

            {/* Quick add mobile */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="md:hidden bg-primary-50 text-primary-600 p-2.5 rounded-xl hover:bg-primary-100 disabled:opacity-40 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          {product.stock <= 0 && (
            <span className="mt-2 text-[11px] text-red-500 font-bold">Out of stock</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
