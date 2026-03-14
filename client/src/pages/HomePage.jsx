import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance.js';
import ProductCard from '../components/product/ProductCard.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCcw, FiHeadphones } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { name: 'Electronics', emoji: '💻', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { name: 'Fashion', emoji: '👗', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100' },
  { name: 'Home & Kitchen', emoji: '🏡', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
  { name: 'Sports', emoji: '⚽', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
  { name: 'Books', emoji: '📚', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
  { name: 'Beauty', emoji: '💄', color: 'bg-rose-50 text-rose-700 hover:bg-rose-100' },
];

const TRUST_BADGES = [
  { icon: FiTruck, title: 'Free Delivery', desc: 'On all orders above ₹499' },
  { icon: FiRefreshCcw, title: 'Easy Returns', desc: '7-day hassle-free returns' },
  { icon: FiShield, title: 'Secure Payments', desc: '100% safe & encrypted' },
  { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated customer care' },
];

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/products/featured');
      return res.data;
    },
  });

  const scrollToFeatured = (e) => {
    e.preventDefault();
    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Ecom. | Your Favourite Online Store</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-indigo-50 -z-10" />
        
        <div className="container-custom pt-16 pb-24 lg:pt-32 lg:pb-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <span className="inline-block py-1 px-3 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold tracking-wide uppercase mb-6">
                New Collection 2025 🎉
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
                Shop Smarter,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500">
                  Live Better.
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl">
                Discover thousands of products across every category — fashion, electronics, home, and more. Fast delivery, easy returns, and unbeatable prices.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products" className="btn-primary px-8 py-4 text-lg">
                  Shop Now
                  <FiArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button onClick={scrollToFeatured} className="btn-secondary px-8 py-4 text-lg bg-transparent">
                  View Featured
                </button>
              </div>
            </motion.div>
            
            {/* Hero Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-200 to-indigo-100 rounded-[3rem] transform rotate-3 scale-105" />
              <img 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Shopping" 
                className="relative z-10 rounded-[3rem] shadow-2xl object-cover h-[540px] w-full"
              />
              
              {/* Floating badges */}
              <div className="absolute top-12 -left-8 z-20 glass p-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce shadow-primary-500/10">
                <div className="bg-green-100 p-2 rounded-full">⭐</div>
                <div>
                  <div className="text-xs text-gray-500">Top Rated</div>
                  <div className="font-bold text-gray-900">Electronics</div>
                </div>
              </div>
              <div className="absolute bottom-16 -right-6 z-20 glass p-4 rounded-xl shadow-lg flex items-center gap-3">
                <div className="bg-primary-100 p-2 rounded-full text-lg">🚚</div>
                <div>
                  <div className="text-xs text-gray-500">Free Delivery</div>
                  <div className="font-bold text-gray-900">On ₹499+</div>
                </div>
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-y border-gray-100">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_BADGES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Shop by Category</h2>
            <p className="text-gray-500 mt-2">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {CATEGORIES.map(({ name, emoji, color }) => (
              <button
                key={name}
                onClick={() => navigate(`/products?category=${encodeURIComponent(name)}`)}
                className={`${color} rounded-2xl p-4 text-center transition-all hover:shadow-md hover:-translate-y-1 duration-200 flex flex-col items-center gap-2`}
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-semibold tracking-wide">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-20 bg-white">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Featured Collection</h2>
              <p className="mt-2 text-gray-500">Handpicked premium products just for you</p>
            </div>
            <Link to="/products" className="hidden sm:inline-flex items-center font-medium text-primary-600 hover:text-primary-700 gap-1">
              View all <FiArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner className="h-10 w-10 text-primary-600" />
            </div>
          ) : data?.products?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-500">No featured products found.</p>
            </div>
          )}
          
          <div className="mt-10 text-center sm:hidden">
            <Link to="/products" className="btn-secondary w-full py-3">View all products</Link>
          </div>
        </div>
      </section>

      {/* CTA — only show when NOT logged in */}
      {!isAuthenticated && (
        <section className="py-24 bg-gray-50">
          <div className="container-custom">
            <div className="bg-gradient-to-br from-primary-600 to-indigo-600 rounded-3xl p-8 md:p-16 text-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary-500 rounded-full opacity-30 blur-3xl" />
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-700 rounded-full opacity-30 blur-3xl" />
              
              <div className="relative z-10 max-w-2xl mx-auto text-white">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Join Ecom. Today</h2>
                <p className="text-primary-100 text-lg mb-8">
                  Create a free account and get exclusive deals, faster checkout, and order tracking.
                </p>
                <Link to="/register" className="btn bg-white text-primary-700 hover:bg-gray-50 px-8 py-4 text-lg shadow-md font-bold hover:shadow-lg transition-all transform hover:-translate-y-1">
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
