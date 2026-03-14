import { Link } from 'react-router-dom';
import { FiTwitter, FiInstagram, FiGithub, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-extrabold text-white">
                Ecom<span className="text-primary-400">.</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              Your favourite online store. Shop thousands of products with fast delivery and easy returns.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <FiTwitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <FiInstagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <FiGithub className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">All Products</Link></li>
              <li><Link to="/products?category=Electronics" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=Fashion" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=Home+%26+Kitchen" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">Home & Kitchen</Link></li>
              <li><Link to="/products?category=Sports" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">Sports</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Account</h3>
            <ul className="space-y-3">
              <li><Link to="/profile" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">My Profile</Link></li>
              <li><Link to="/orders" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">My Orders</Link></li>
              <li><Link to="/cart" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/login" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">Register</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <FiMapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary-400" /> Mumbai, India
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <FiPhone className="h-4 w-4 flex-shrink-0 text-primary-400" /> +91 98765 43210
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <FiMail className="h-4 w-4 flex-shrink-0 text-primary-400" /> support@ecom.in
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Ecom., Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link to="/returns" className="hover:text-gray-300 transition-colors">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
