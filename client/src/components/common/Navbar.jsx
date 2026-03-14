import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX, FiGrid, FiSearch, FiPackage } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { logoutUser } from '../../features/auth/authSlice.js';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance.js';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const cartItemCount = items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleLogout = () => {
    dispatch(logoutUser()).unwrap().then(() => {
      toast.success('Logged out successfully');
      navigate('/login');
    });
  };

  // Fetch search suggestions with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await axiosInstance.get(`/products?keyword=${encodeURIComponent(searchQuery)}&limit=5`);
        setSuggestions(res.data.products || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  const handleSuggestionClick = (product) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/products/${product.slug}`);
  };

  return (
    <nav className="fixed w-full z-50 glass shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Ecom<span className="text-primary-600">.</span>
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden sm:flex flex-1 max-w-lg relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full flex items-center">
              <div className="relative w-full">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {isSearching ? (
                  <div className="p-4 text-sm text-gray-500 text-center">Searching...</div>
                ) : suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map(product => (
                      <li key={product._id}>
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick(product)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                        >
                          <img
                            src={product.images?.[0]?.url || ''}
                            alt={product.name}
                            className="w-9 h-9 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">₹{product.discountPrice || product.price}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                    <li className="border-t border-gray-100">
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full text-center py-2 text-xs text-primary-600 font-semibold hover:bg-gray-50 transition-colors"
                      >
                        See all results for "{searchQuery}"
                      </button>
                    </li>
                  </ul>
                ) : (
                  <div className="p-4 text-sm text-gray-500 text-center">No results found</div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Nav Icons */}
          <div className="hidden sm:flex items-center space-x-4">
            <Link to="/products" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors hidden lg:inline">
              Products
            </Link>

            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <FiShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full transform translate-x-1/4 -translate-y-1/4">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {user?.role === 'admin' && (
                  <Link to="/admin"
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    <FiGrid className="text-sm" /> Admin
                  </Link>
                )}
                <Link to="/orders" className="p-2 text-gray-600 hover:text-primary-600 transition-colors" title="My Orders">
                  <FiPackage className="h-5 w-5" />
                </Link>
                <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium hidden lg:inline">{user?.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-50" title="Logout">
                  <FiLogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="btn-secondary px-4 py-2 text-sm">Login</Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-sm">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link to="/cart" className="relative p-2 text-gray-600">
              <FiShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full transform translate-x-1/4 -translate-y-1/4">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 shadow-lg">
          {/* Mobile Search */}
          <div className="px-4 py-3 border-b border-gray-100">
            <form onSubmit={(e) => { handleSearchSubmit(e); setIsMobileMenuOpen(false); }} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <button type="submit" className="btn-primary px-3 py-2 text-sm"><FiSearch /></button>
            </form>
          </div>

          <div className="pt-2 pb-3 space-y-1">
            {[{ name: 'Home', path: '/' }, { name: 'Products', path: '/products' }].map((link) => (
              <Link key={link.name} to={link.path}
                className="block pl-4 pr-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-primary-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="flex items-center px-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.name}</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>
                )}
                <Link to="/profile" className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
                <Link to="/orders" className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50">
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-2 px-4 pb-2">
                <Link to="/login" className="block w-full text-center py-2 btn-secondary" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block w-full text-center py-2 btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
