import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Twitter, Facebook, MoveRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="pt-20 pb-10 mt-auto bg-surface-50 border-t border-surface-300">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                Ecom<span className="text-primary-500">.</span>
              </span>
            </Link>
            <p className="text-base leading-relaxed mb-8 pr-4 text-gray-700">
              We're redefining the online shopping experience with premium, handpicked collections. Discover quality products delivered to your door.
            </p>
            
            {/* Newsletter */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-3">Newsletter</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-white text-gray-900 placeholder-gray-400 px-4 py-3 rounded-l-xl text-sm w-full focus:outline-none border border-surface-300 focus:border-primary-500"
                />
                <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-r-xl transition-colors">
                  <MoveRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <p className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">Shop</p>
            <ul className="space-y-4">
              {['All Products', 'New Arrivals', 'Featured', 'Electronics', 'Fashion'].map((item) => (
                <li key={item}>
                  <Link to={`/products${item !== 'All Products' ? '?category='+item : ''}`} className="text-sm text-gray-700 hover:text-primary-600 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <p className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">Support</p>
            <ul className="space-y-4">
              {['FAQ', 'Shipping Policy', 'Returns', 'Track Order', 'Contact Us'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-gray-700 hover:text-primary-600 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">Contact</p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-primary-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">123 Commerce St, Premium Avenue, City 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">support@ecom.in</span>
              </li>
            </ul>

            <div className="flex gap-4 mt-8">
              <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-surface-300">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Ecom. All rights reserved. Built with passion.
          </p>
          <div className="flex gap-6">
            <Link to="/" className="text-xs text-gray-600 hover:text-primary-600 transition-colors">Privacy Policy</Link>
            <Link to="/" className="text-xs text-gray-600 hover:text-primary-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
