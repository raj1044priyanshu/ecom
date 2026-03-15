import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance.js';
import ProductCard from '../components/product/ProductCard.jsx';
import Spinner from '../components/common/Spinner.jsx';
import {
  ArrowRight, Shield, Truck, RotateCcw, Headphones,
  Monitor, Shirt, Home, Dumbbell, BookOpen, Sparkles,
  Star, BadgeCheck, Package, Zap
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { name: 'Electronics', Icon: Monitor, bg: '#e8f4fd', color: '#1d6fa4' },
  { name: 'Fashion',     Icon: Shirt,   bg: '#fdf0f8', color: '#a4197c' },
  { name: 'Home & Kitchen', Icon: Home, bg: '#fdf6e8', color: '#a46b19' },
  { name: 'Sports',      Icon: Dumbbell,bg: '#edf9f2', color: '#1a804a' },
  { name: 'Books',       Icon: BookOpen,bg: '#f0edfb', color: '#5a30a4' },
  { name: 'Beauty',      Icon: Sparkles,bg: '#fceef0', color: '#a4192b' },
];

const TRUST_BADGES = [
  { icon: Truck,      title: 'Free Delivery',    desc: 'On all orders above ₹499' },
  { icon: RotateCcw,  title: 'Easy Returns',     desc: '7-day hassle-free returns' },
  { icon: Shield,     title: 'Secure Payments',  desc: '100% safe & encrypted' },
  { icon: Headphones, title: '24/7 Support',     desc: 'Dedicated customer care' },
];

const FEATURES = [
  { icon: Zap,     title: 'Lightning Fast', desc: 'Orders shipped within 24 hours' },
  { icon: Package, title: 'Premium Packing', desc: 'Every item packed with care' },
  { icon: Star,    title: 'Curated Quality', desc: 'Handpicked products you\'ll love' },
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
    <div className="min-h-screen bg-surface-50">
      <Helmet>
        <title>Ecom. | Your Favourite Online Store</title>
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-surface-100">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a7f3d0 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #fde68a 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="container-custom pt-20 pb-24 lg:pt-32 lg:pb-40 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl"
            >
              <span className="inline-flex items-center gap-2 text-primary-700 font-semibold text-sm mb-6 py-1.5 px-4 rounded-full border border-primary-200 bg-primary-50">
                <BadgeCheck className="h-4 w-4" strokeWidth={2.5} />
                New Collection 2025
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
                Shop What{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary-600">You Love</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-3 rounded-full opacity-30 -z-10 bg-primary-400" />
                </span>
                {' '}Delivered Fast.
              </h1>

              <p className="text-lg text-gray-700 mb-10 leading-relaxed">
                Discover thousands of carefully curated products — fashion, electronics, home & more.
                Fast delivery, easy returns, and unbeatable prices.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/products"
                  className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-primary-200 hover:shadow-primary-300 hover:-translate-y-0.5 active:scale-[0.98]">
                  Shop Now <ArrowRight className="h-5 w-5" />
                </Link>
                <button onClick={scrollToFeatured}
                  className="inline-flex items-center justify-center font-semibold text-gray-800 px-8 py-4 rounded-xl text-base border border-gray-200 hover:bg-white hover:border-gray-300 transition-all bg-white/50">
                  View Featured
                </button>
              </div>

              {/* Stats row */}
              <div className="flex gap-8 mt-10 pt-8 border-t border-gray-100">
                {[['10K+', 'Products'], ['50K+', 'Customers'], ['4.9', 'Rating']].map(([val, lbl]) => (
                  <div key={lbl}>
                    <p className="text-2xl font-extrabold text-gray-900">{val}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{lbl}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              {/* Image */}
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl" style={{ height: '520px' }}>
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Shopping"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400/10 to-transparent" />
              </div>

              {/* Floating card — Top Rated */}
              <div className="absolute -left-8 top-12 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-3 z-10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100">
                  <Star className="h-5 w-5 fill-amber-500 stroke-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Top Rated</p>
                  <p className="text-sm font-bold text-gray-900">Electronics</p>
                </div>
              </div>

              {/* Floating card — Free Delivery */}
              <div className="absolute -right-6 bottom-16 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-3 z-10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-100">
                  <Truck className="h-5 w-5 text-primary-600" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Free Delivery</p>
                  <p className="text-sm font-bold text-gray-900">On ₹499+</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── TRUST BADGES ─── */}
      <section className="bg-surface-50 border-y border-surface-300">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 p-4 rounded-2xl hover:bg-surface-100 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-50">
                  <Icon className="h-5 w-5 text-primary-600" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="py-16 bg-surface-100">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-gray-600 mt-2 text-sm">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES.map(({ name, Icon, bg, color }) => (
              <button
                key={name}
                onClick={() => navigate(`/products?category=${encodeURIComponent(name)}`)}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-md duration-200 border border-transparent hover:border-gray-100 bg-white"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="h-5 w-5" style={{ color }} strokeWidth={1.75} />
                </div>
                <span className="text-xs font-semibold text-gray-800 leading-tight text-center">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES STRIP ─── */}
      <section className="py-12 bg-white border-y border-surface-300">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-6 rounded-2xl bg-surface-50 border border-surface-300">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-100 text-primary-600">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{title}</p>
                  <p className="text-xs mt-1 text-gray-700">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      <section id="featured" className="py-20 bg-surface-50">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Collection</h2>
              <p className="mt-1.5 text-gray-600 text-sm">Handpicked premium products just for you</p>
            </div>
            <Link to="/products" className="hidden sm:inline-flex items-center gap-1.5 font-semibold text-primary-600 hover:text-primary-700 text-sm">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner className="h-10 w-10 text-primary-600" />
            </div>
          ) : data?.products?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {data.products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl border border-gray-100">
              <p className="text-gray-600">No featured products found.</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/products" className="btn-secondary w-full py-3">View all products</Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      {!isAuthenticated && (
        <section className="py-20 bg-surface-100">
          <div className="container-custom">
            <div className="rounded-3xl overflow-hidden relative bg-white border border-surface-300 shadow-xl shadow-surface-200/50">
              {/* Green glow */}
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none bg-primary-400"
                style={{ transform: 'translate(30%, -30%)' }} />
              <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none bg-primary-300"
                style={{ transform: 'translate(-30%, 30%)' }} />
              
              <div className="relative z-10 px-8 py-16 md:px-16 text-center max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Join Ecom. Today</h2>
                <p className="text-base mb-8 text-gray-700">
                  Create a free account and unlock exclusive deals, faster checkout, and real-time order tracking.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/register"
                    className="inline-flex items-center gap-2 justify-center bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-4 rounded-xl text-base shadow-lg shadow-primary-200 transition-all hover:-translate-y-0.5">
                    Create Free Account <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link to="/products"
                    className="inline-flex items-center justify-center font-semibold text-gray-800 px-8 py-4 rounded-xl text-base border border-surface-300 hover:bg-surface-50 transition-all">
                    Browse Products
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
