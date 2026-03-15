import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingCart, User, LogOut, Menu, X, LayoutDashboard,
  Search, Package, ChevronRight
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { logoutUser } from '../../features/auth/authSlice.js';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance.js';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const cartCount = items?.reduce((a, i) => a + i.quantity, 0) || 0;

  const handleLogout = () => {
    dispatch(logoutUser()).unwrap().then(() => {
      toast.success('Logged out');
      navigate('/login');
    });
  };

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axiosInstance.get(`/products?keyword=${encodeURIComponent(searchQuery)}&limit=5`);
        setSuggestions(res.data.products || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 280);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  useEffect(() => {
    const fn = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  return (
    <nav className="fixed w-full z-50" style={{ background: 'rgba(250,250,247,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #eeeee6' }}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-xl font-extrabold tracking-tight" style={{ color: '#1c1c1a' }}>
              Ecom<span style={{ color: '#16a34a' }}>.</span>
            </span>
          </Link>

          {/* Search (desktop) */}
          <div className="hidden sm:flex flex-1 max-w-sm relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#9ca3af' }} strokeWidth={2} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl transition-all outline-none"
                  style={{ background: '#f5f5f0', border: '1.5px solid #eeeee6', color: '#1c1c1a' }}
                />
              </div>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl z-50 overflow-hidden" style={{ border: '1px solid #eeeee6' }}>
                <ul>
                  {suggestions.map((p) => (
                    <li key={p._id}>
                      <button type="button"
                        onClick={() => { setShowSuggestions(false); setSearchQuery(''); navigate(`/products/${p.slug}`); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-50 transition-colors text-left"
                      >
                        <img src={p.images?.[0]?.url || ''} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" style={{ border: '1px solid #eeeee6' }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate" style={{ color: '#1c1c1a' }}>{p.name}</p>
                          <p className="text-xs text-gray-600">₹{p.discountPrice || p.price}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-1">
            <Link to="/products" className="text-sm font-medium px-3 py-2 rounded-lg transition-colors hidden lg:inline"
              style={{ color: '#4b5563' }}
              onMouseEnter={e => e.target.style.color = '#16a34a'}
              onMouseLeave={e => e.target.style.color = '#4b5563'}>
              Products
            </Link>

            <Link to="/cart" className="relative p-2.5 rounded-xl transition-colors hover:bg-surface-100">
              <ShoppingCart className="h-5 w-5" style={{ color: '#374151' }} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center h-4 w-4 text-[10px] font-bold text-white rounded-full" style={{ background: '#16a34a' }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-1 ml-1">
                {user?.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white transition-colors" style={{ background: '#16a34a' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
                    onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}>
                    <LayoutDashboard className="h-3.5 w-3.5" /> Admin
                  </Link>
                )}
                <Link to="/orders" className="p-2.5 rounded-xl transition-colors hover:bg-surface-100" title="My Orders">
                  <Package className="h-5 w-5" style={{ color: '#374151' }} strokeWidth={2} />
                </Link>
                <Link to="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface-100 transition-colors">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border-2" style={{ borderColor: '#eeeee6' }} />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#dcfce7', color: '#15803d' }}>
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium hidden lg:inline" style={{ color: '#374151' }}>{user?.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="p-2.5 rounded-xl transition-colors hover:bg-red-50 text-gray-600 hover:text-red-500" title="Logout">
                  <LogOut className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 ml-1">
                <Link to="/login" className="btn-secondary px-4 py-2 text-sm">Login</Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-sm">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex items-center gap-1 sm:hidden">
            <Link to="/cart" className="relative p-2.5 rounded-xl">
              <ShoppingCart className="h-5 w-5" style={{ color: '#374151' }} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center h-4 w-4 text-[10px] font-bold text-white rounded-full" style={{ background: '#16a34a' }}>
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2.5 rounded-xl text-gray-700 hover:bg-surface-100 transition-colors">
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white" style={{ borderTop: '1px solid #eeeee6' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #eeeee6' }}>
            <form onSubmit={(e) => { handleSearch(e); setIsMobileMenuOpen(false); }} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2.5 text-sm rounded-xl outline-none"
                style={{ background: '#f5f5f0', border: '1.5px solid #eeeee6' }}
              />
              <button type="submit" className="btn-primary px-3 py-2">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="p-2 space-y-0.5">
            {[{ name: 'Home', path: '/' }, { name: 'Products', path: '/products' }].map(({ name, path }) => (
              <Link key={name} to={path} onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-800 rounded-xl hover:bg-surface-50 transition-colors">
                {name}
              </Link>
            ))}
          </div>

          <div className="px-2 pb-4 pt-2" style={{ borderTop: '1px solid #f5f5f0' }}>
            {isAuthenticated ? (
              <div className="space-y-0.5">
                <div className="flex items-center gap-3 px-4 py-3 mb-1">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#dcfce7', color: '#15803d' }}>
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-green-50 text-primary-700">
                    <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                  </Link>
                )}
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-800 rounded-xl hover:bg-surface-50">
                  <User className="h-4 w-4" /> My Profile
                </Link>
                <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-800 rounded-xl hover:bg-surface-50">
                  <Package className="h-4 w-4" /> My Orders
                </Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-2 px-2 pb-2 pt-2">
                <Link to="/login" className="block w-full text-center py-2.5 btn-secondary" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block w-full text-center py-2.5 btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
