import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiHome, FiSearch } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>404 - Page Not Found | Ecom.</title>
      </Helmet>

      <div className="max-w-max mx-auto text-center">
        <main className="sm:flex">
          <p className="text-4xl font-extrabold text-primary-600 sm:text-5xl">404</p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                Page not found
              </h1>
              <p className="mt-2 text-base text-gray-500">
                Please check the URL in the address bar and try again.
              </p>
            </div>
            <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6 justify-center sm:justify-start">
              <Link
                to="/"
                className="btn-primary px-6 py-3 text-sm flex items-center gap-2"
              >
                <FiHome className="h-4 w-4" />
                Go back home
              </Link>
              <Link
                to="/products"
                className="btn-secondary px-6 py-3 text-sm flex items-center gap-2"
              >
                <FiSearch className="h-4 w-4" />
                Browse Products
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotFoundPage;
