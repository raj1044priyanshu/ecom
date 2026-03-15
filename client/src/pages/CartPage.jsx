import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, Minus, Plus, ArrowRight, ShoppingCart, ShieldCheck, Zap } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { updateCartItem, removeFromCart, clearCart } from '../features/cart/cartSlice.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import ErrorBoundary from '../components/common/ErrorBoundary.jsx';

const CartPage = () => {
  const { items = [], totalPrice = 0, isLoading = false } = useSelector((state) => state.cart) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleUpdateQuantity = (productId, newQuantity, stock) => {
    if (newQuantity > 0 && newQuantity <= stock) {
      dispatch(updateCartItem({ productId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center section-cream">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] section-cream flex flex-col justify-center items-center px-4">
        <Helmet><title>Your Cart | Ecom.</title></Helmet>
        <div className="bg-white p-12 rounded-[2rem] shadow-sm text-center max-w-lg w-full border border-surface-300">
          <div className="w-24 h-24 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-[-10deg]">
            <ShoppingCart className="h-10 w-10" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Your cart is empty</h2>
          <p className="text-gray-700 font-medium mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn-primary w-full py-4 text-base shadow-lg shadow-primary-500/20">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="section-cream min-h-screen py-8 sm:py-12">
      <Helmet>
        <title>{`Shopping Cart (${items.length}) | Ecom.`}</title>
      </Helmet>

      <div className="container-custom">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-8">Shopping Cart</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8">
            <div className="bg-white shadow-sm rounded-2xl border border-surface-300 overflow-hidden">
              <ul className="divide-y divide-surface-100">
                {items.filter(item => item && item.product).map((item) => (
                  <li key={item.product._id} className="flex py-6 px-4 sm:px-6">
                    <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 border border-surface-300 rounded-2xl overflow-hidden bg-surface-50">
                      <img
                        src={item.product.images[0]?.url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="ml-5 flex-1 flex flex-col justify-between">
                      <div className="relative">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm sm:text-lg font-bold text-gray-900 pr-8 line-clamp-2 leading-snug">
                            <Link to={`/products/${item.product.slug}`} className="hover:text-primary-600 transition-colors">
                              {item.product.name}
                            </Link>
                          </h3>
                          <p className="ml-4 text-sm font-black text-gray-900 border border-surface-300 px-3 py-1.5 rounded-xl bg-surface-50 shadow-sm whitespace-nowrap">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="mt-1.5 text-xs text-gray-700 font-bold uppercase tracking-wider">{item.product.category}</p>
                      </div>

                      <div className="flex-1 flex items-end justify-between text-sm mt-4">
                        <div className="flex items-center border border-surface-300 rounded-xl bg-white shadow-sm">
                          <button
                            type="button"
                            className="p-2 sm:p-2.5 text-gray-800 hover:text-primary-600 hover:bg-surface-50 rounded-l-xl transition-colors focus:outline-none disabled:opacity-50"
                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1, item.product.stock)}
                            disabled={item.quantity <= 1}
                          >
                            <span className="sr-only">Decrease quantity</span>
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={2.5} />
                          </button>
                          
                          <span className="px-3 sm:px-4 py-1.5 font-bold text-gray-900 border-x border-surface-300 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          
                          <button
                            type="button"
                            className="p-2 sm:p-2.5 text-gray-800 hover:text-primary-600 hover:bg-surface-50 rounded-r-xl transition-colors focus:outline-none disabled:opacity-50"
                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1, item.product.stock)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <span className="sr-only">Increase quantity</span>
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={2.5} />
                          </button>
                        </div>

                        <div className="flex">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.product._id)}
                            className="text-sm font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2.5 rounded-xl transition-colors flex items-center border border-transparent shadow-sm"
                          >
                            <span className="hidden sm:inline mr-1.5">Remove</span>
                            <Trash2 className="h-4 w-4" strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="bg-surface-50 px-4 py-4 sm:px-6 border-t border-surface-300 flex justify-end">
                 <button 
                  onClick={handleClearCart}
                  className="text-sm font-bold text-gray-700 hover:text-gray-800 transition-colors underline underline-offset-4"
                >
                  Clear entire cart
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white shadow-xl shadow-surface-200/50 rounded-[2rem] border border-surface-300 p-6 sm:p-8 sticky top-24">
              <h2 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Order Summary</h2>

              <dl className="mt-6 space-y-4 text-sm text-gray-800 font-medium">
                <div className="flex items-center justify-between">
                  <dt>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</dt>
                  <dd className="font-bold text-gray-900">{formatCurrency(totalPrice)}</dd>
                </div>
                
                <div className="flex items-center justify-between border-t border-surface-300 pt-4">
                  <dt className="flex items-center">
                    <span>Shipping estimate</span>
                  </dt>
                  <dd className="font-bold text-primary-600">{items.length === 0 ? formatCurrency(0) : (totalPrice > 500 ? 'Free' : formatCurrency(30))}</dd>
                </div>

                <div className="flex items-center justify-between border-t border-surface-300 pt-4 mt-4">
                  <dt className="text-lg font-black text-gray-900">Total</dt>
                  <dd className="text-3xl font-black text-gray-900 tracking-tight">
                    {items.length === 0 ? formatCurrency(0) : formatCurrency(totalPrice + (totalPrice > 500 ? 0 : 30))}
                  </dd>
                </div>
              </dl>

              <div className="mt-8 space-y-4">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full btn-primary py-4 text-base sm:text-lg flex justify-center items-center gap-2 shadow-lg shadow-primary-500/25"
                >
                  Proceed to Checkout
                  <ArrowRight strokeWidth={2.5} className="h-5 w-5" />
                </button>
                <div className="text-center">
                  <span className="text-xs text-gray-600 font-bold block mb-2 uppercase tracking-widest">or</span>
                  <Link to="/products" className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors inline-block">
                    Continue Shopping &rarr;
                  </Link>
                </div>
              </div>
              
              {/* Trust Badges */}
              <div className="mt-8 flex justify-center gap-6 border-t border-surface-300 pt-6">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-6 h-6 text-gray-600 mb-1.5" strokeWidth={1.5} />
                  <span className="text-[10px] text-gray-700 uppercase tracking-widest font-bold">Secure</span>
                </div>
                <div className="flex flex-col items-center">
                  <Zap className="w-6 h-6 text-gray-600 mb-1.5" strokeWidth={1.5} />
                  <span className="text-[10px] text-gray-700 uppercase tracking-widest font-bold">Fast Delivery</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default CartPage;
