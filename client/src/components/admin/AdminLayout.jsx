import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiGrid, FiBox, FiShoppingBag, FiUsers,
  FiLogOut, FiHome, FiMenu, FiX, FiChevronRight,
} from 'react-icons/fi';
import { logoutUser } from '../../features/auth/authSlice.js';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/admin', name: 'Dashboard', icon: FiGrid, exact: true },
  { path: '/admin/products', name: 'Products', icon: FiBox },
  { path: '/admin/orders', name: 'Orders', icon: FiShoppingBag },
  { path: '/admin/users', name: 'Users', icon: FiUsers },
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
      <div className="flex items-center gap-2 px-4 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">A</div>
        <div>
          <div className="text-sm font-bold text-gray-900">Admin Portal</div>
          <div className="text-xs text-gray-400 truncate w-32">{user?.name || 'Admin'}</div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            onClick={onNav}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`text-lg flex-shrink-0 ${isActive ? 'text-primary-600' : ''}`} />
                <span className="flex-1">{item.name}</span>
                {isActive && <FiChevronRight className="text-primary-400 text-sm" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <hr className="my-4 border-gray-100" />

      {/* Bottom Links */}
      <div className="space-y-1">
        <Link
          to="/"
          onClick={onNav}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all text-sm"
        >
          <FiHome className="text-lg" />
          Back to Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all text-sm"
        >
          <FiLogOut className="text-lg" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 pt-16 w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-20 right-3 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <FiX />
        </button>
        <SidebarContent onNav={() => setSidebarOpen(false)} />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 pt-16 w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:flex flex-col z-10">
        <SidebarContent onNav={() => {}} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)] flex flex-col">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-16 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <FiMenu className="text-xl" />
          </button>
          <span className="font-semibold text-gray-900 text-sm">Admin Dashboard</span>
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
