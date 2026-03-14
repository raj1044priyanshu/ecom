import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingCart } from 'react-icons/fi';
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
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex flex-col justify-center items-center px-4">
        <Helmet><title>Your Cart | Ecom.</title></Helmet>
        <div className="bg-white p-12 rounded-3xl shadow-sm text-center max-w-lg w-full border border-gray-100">
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-500">
            <FiShoppingCart className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn-primary w-full py-4 text-lg">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
      <Helmet>
        <title>{`Shopping Cart (${items.length}) | Ecom.`}</title>
      </Helmet>

      <div className="container-custom">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Shopping Cart</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8">
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {items.filter(item => item && item.product).map((item) => (
                  <li key={item.product._id} className="flex py-6 px-4 sm:px-6">
                    <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                      <img
                        src={item.product.images[0]?.url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="ml-4 flex-1 flex flex-col justify-between">
                      <div className="relative">
                        <div className="flex justify-between">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 pr-8 line-clamp-2">
                            <Link to={`/products/${item.product.slug}`} className="hover:text-primary-600 transition-colors">
                              {item.product.name}
                            </Link>
                          </h3>
                          <p className="ml-4 text-sm font-bold text-gray-900 border border-gray-200 px-3 py-1 rounded-lg bg-gray-50">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 uppercase tracking-wider">{item.product.category}</p>
                      </div>

                      <div className="flex-1 flex items-end justify-between text-sm">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm">
                          <button
                            type="button"
                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-l-lg transition-colors focus:outline-none disabled:opacity-50"
                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1, item.product.stock)}
                            disabled={item.quantity <= 1}
                          >
                            <span className="sr-only">Decrease quantity</span>
                            <FiMinus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          
                          <span className="px-3 sm:px-4 py-1 font-semibold text-gray-900 border-x border-gray-200 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          
                          <button
                            type="button"
                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-r-lg transition-colors focus:outline-none disabled:opacity-50"
                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1, item.product.stock)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <span className="sr-only">Increase quantity</span>
                            <FiPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>

                        <div className="flex">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.product._id)}
                            className="text-sm font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors flex items-center shadow-sm"
                          >
                            <span className="hidden sm:inline mr-1">Remove</span>
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-100 flex justify-end">
                 <button 
                  onClick={handleClearCart}
                  className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors underline underline-offset-4"
                >
                  Clear entire cart
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6 sm:p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Order Summary</h2>

              <dl className="mt-6 space-y-4 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <dt>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</dt>
                  <dd className="font-medium text-gray-900">{formatCurrency(totalPrice)}</dd>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <dt className="flex items-center">
                    <span>Shipping estimate</span>
                  </dt>
                  <dd className="font-medium text-gray-900">{items.length === 0 ? formatCurrency(0) : (totalPrice > 500 ? 'Free' : formatCurrency(30))}</dd>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
                  <dt className="text-lg font-bold text-gray-900">Order Total</dt>
                  <dd className="text-2xl font-extrabold text-gray-900">
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
                  <FiArrowRight />
                </button>
                <div className="text-center">
                  <span className="text-xs text-gray-500 block mb-2">or</span>
                  <Link to="/products" className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors">
                    Continue Shopping &rarr;
                  </Link>
                </div>
              </div>
              
              {/* Trust Badges */}
              <div className="mt-8 flex justify-center gap-4 border-t border-gray-100 pt-6">
                <div className="flex flex-col items-center">
                  <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center">
                  <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Quick Delivery</span>
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
