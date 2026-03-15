import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Box, ShoppingBag, Users,
  LogOut, Home, Menu, X, ChevronRight, Shield
} from 'lucide-react';
import { logoutUser } from '../../features/auth/authSlice.js';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/admin', name: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/products', name: 'Products', icon: Box },
  { path: '/admin/orders', name: 'Orders', icon: ShoppingBag },
  { path: '/admin/users', name: 'Users', icon: Users },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const SidebarContent = ({ onNav }) => (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 mb-10">
        <div className="w-10 h-10 rounded-xl bg-primary-500 shadow-sm flex items-center justify-center text-white font-black">
          <Shield className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-sm font-black text-gray-900 tracking-tight uppercase">Dashboard</div>
          <div className="text-[10px] font-bold text-gray-700 uppercase tracking-widest truncate w-32">{user?.name || 'Administrator'}</div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            onClick={onNav}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-sm font-bold border ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-primary-200 shadow-sm'
                  : 'text-gray-800 border-transparent hover:bg-surface-100 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-600'}`} strokeWidth={isActive ? 3 : 2} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="h-4 w-4 text-primary-400" strokeWidth={3} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <hr className="my-6 border-surface-300" />

      {/* Bottom Links */}
      <div className="space-y-2">
        <Link
          to="/"
          onClick={onNav}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-800 font-bold border border-transparent hover:bg-surface-100 hover:text-gray-900 transition-all text-sm"
        >
          <Home className="h-5 w-5 text-gray-600" strokeWidth={2.5} />
          Back to Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-800 font-bold border border-transparent hover:bg-surface-100 hover:text-gray-900 transition-all text-sm"
        >
          <LogOut className="h-5 w-5 text-gray-600" strokeWidth={2.5} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 pt-16 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 pt-16 w-72 bg-white border-r border-surface-300 z-50 transition-transform duration-300 md:hidden shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-20 right-4 p-2 rounded-xl bg-surface-100 text-gray-700 hover:bg-surface-200 hover:text-gray-900 transition-colors border border-transparent hover:border-surface-300"
        >
          <X className="h-5 w-5" strokeWidth={2.5} />
        </button>
        <SidebarContent onNav={() => setSidebarOpen(false)} />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 pt-16 w-72 bg-white border-r border-surface-300 overflow-y-auto hidden md:flex flex-col z-10 shadow-sm">
        <SidebarContent onNav={() => {}} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 min-h-[calc(100vh-4rem)] flex flex-col pt-4 md:pt-0">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center gap-4 px-5 py-4 bg-white border-b border-surface-300 sticky top-16 z-20 shadow-sm mx-4 rounded-2xl mt-2 mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-surface-100 text-gray-800 hover:bg-surface-200 hover:text-gray-900 transition-colors border border-surface-300 shadow-sm"
          >
            <Menu className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <span className="font-black text-gray-900 text-base tracking-tight uppercase">Admin Panel</span>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
