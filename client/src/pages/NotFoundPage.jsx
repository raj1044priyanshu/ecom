import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen section-cream flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-20">
      <Helmet>
        <title>404 - Page Not Found | Ecom.</title>
      </Helmet>

      <div className="max-w-2xl mx-auto text-center card p-12 md:p-16 shadow-xl border-2 border-surface-300 rounded-[2rem]">
        <div className="mb-8">
          <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg rotate-12">
            <Search className="w-12 h-12" strokeWidth={3} />
          </div>
          <h1 className="text-8xl font-black text-gray-900 tracking-tighter mb-4">404</h1>
          <h2 className="text-3xl font-black text-primary-700 tracking-tight">
            Page not found
          </h2>
          <p className="mt-4 text-base font-medium text-gray-700 max-w-sm mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 border-t-2 border-surface-300">
          <Link
            to="/"
            className="btn-primary w-full sm:w-auto px-8 py-3.5 text-sm flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" strokeWidth={2.5} />
            Go back home
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-gray-800 bg-white border-2 border-surface-300 rounded-xl hover:border-primary-400 hover:text-primary-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Search className="h-5 w-5 text-gray-600" strokeWidth={2.5} />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
