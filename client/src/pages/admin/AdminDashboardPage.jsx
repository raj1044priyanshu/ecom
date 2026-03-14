import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FiDollarSign, FiShoppingBag, FiBox, FiUsers,
  FiTrendingUp, FiArrowRight, FiPackage, FiCheckCircle, FiClock, FiXCircle,
} from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance.js';
import Spinner from '../../components/common/Spinner.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  Delivered:  { bg: 'bg-green-100 text-green-700',  icon: FiCheckCircle },
  Processing: { bg: 'bg-blue-100 text-blue-700',    icon: FiClock },
  Shipped:    { bg: 'bg-purple-100 text-purple-700', icon: FiPackage },
  Cancelled:  { bg: 'bg-red-100 text-red-700',      icon: FiXCircle },
  Pending:    { bg: 'bg-amber-100 text-amber-700',   icon: FiClock },
};

const StatCard = ({ title, value, icon: Icon, color, subtitle, linkTo }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="text-xl" />
      </div>
      {linkTo && (
        <Link to={linkTo} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
          View <FiArrowRight className="text-xs" />
        </Link>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-sm font-medium text-gray-500">{title}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

const AdminDashboardPage = () => {
  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const res = await axiosInstance.get('/orders');
      return res.data;
    },
  });

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['adminProductsAll', 'dashboard'],
    queryFn: async () => {
      const res = await axiosInstance.get('/products?limit=100');
      return res.data;
    },
  });

  const orders = ordersData?.orders || [];
  const products = productsData?.products || [];

  // Derived metrics
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const delivered = orders.filter(o => o.orderStatus === 'Delivered').length;
    const processing = orders.filter(o => o.orderStatus === 'Processing').length;
    const outOfStock = products.filter(p => p.stock === 0).length;

    // Category breakdown
    const categoryMap = {};
    products.forEach(p => {
      if (!categoryMap[p.category]) categoryMap[p.category] = 0;
      categoryMap[p.category]++;
    });
    const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { totalRevenue, delivered, processing, outOfStock, categories };
  }, [orders, products]);

  const recentOrders = [...orders].slice(0, 8);

  if (loadingOrders || loadingProducts) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-10 w-10 text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening in your store.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={FiDollarSign}
          color="bg-primary-50 text-primary-600"
          subtitle={`${orders.length} total orders`}
          linkTo="/admin/orders"
        />
        <StatCard
          title="Total Orders"
          value={orders.length}
          icon={FiShoppingBag}
          color="bg-purple-50 text-purple-600"
          subtitle={`${stats.delivered} delivered`}
          linkTo="/admin/orders"
        />
        <StatCard
          title="Products Listed"
          value={products.length}
          icon={FiBox}
          color="bg-blue-50 text-blue-600"
          subtitle={`${stats.outOfStock} out of stock`}
          linkTo="/admin/products"
        />
        <StatCard
          title="Pending Orders"
          value={stats.processing}
          icon={FiClock}
          color="bg-amber-50 text-amber-600"
          subtitle="Awaiting fulfillment"
          linkTo="/admin/orders"
        />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders — wide */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View all <FiArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 px-6 font-medium">Order</th>
                  <th className="py-3 px-6 font-medium">Customer</th>
                  <th className="py-3 px-6 font-medium">Status</th>
                  <th className="py-3 px-6 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => {
                    const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.Pending;
                    const StatusIcon = cfg.icon;
                    return (
                      <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-6">
                          <p className="text-sm font-semibold text-gray-800">#{order._id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-gray-400">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                        </td>
                        <td className="py-3 px-6">
                          <p className="text-sm text-gray-800">{order.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{order.items.length} items</p>
                        </td>
                        <td className="py-3 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg}`}>
                            <StatusIcon className="text-xs" />
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-sm font-bold text-gray-900 text-right">
                          {formatCurrency(order.totalPrice)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-gray-400 text-sm">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Order Status Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Order Status</h2>
            <div className="space-y-3">
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                const count = orders.filter(o => o.orderStatus === status).length;
                const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                const StatusIcon = cfg.icon;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${cfg.bg}`}>
                      <StatusIcon className="text-xs" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{status}</span>
                        <span className="text-gray-500 text-xs">{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            status === 'Delivered' ? 'bg-green-400' :
                            status === 'Processing' ? 'bg-blue-400' :
                            status === 'Shipped' ? 'bg-purple-400' :
                            status === 'Cancelled' ? 'bg-red-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Top Categories</h2>
            {stats.categories.length > 0 ? (
              <ul className="space-y-3">
                {stats.categories.map(([cat, count]) => (
                  <li key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate">{cat}</span>
                    <span className="ml-3 text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No products yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
