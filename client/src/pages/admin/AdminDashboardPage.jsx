import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingBag, Box, Users,
  TrendingUp, ArrowRight, Package, CheckCircle, Clock, XCircle,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance.js';
import Spinner from '../../components/common/Spinner.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  Delivered:  { bg: 'bg-primary-100 text-primary-700',  icon: CheckCircle },
  Processing: { bg: 'bg-amber-100 text-amber-700',    icon: Clock },
  Shipped:    { bg: 'bg-blue-100 text-blue-700', icon: Package },
  Cancelled:  { bg: 'bg-red-100 text-red-700',      icon: XCircle },
  Pending:    { bg: 'bg-surface-100 text-gray-800',   icon: Clock },
};

const StatCard = ({ title, value, icon: Icon, color, subtitle, linkTo }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-surface-300 hover:border-primary-300 transition-colors">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3.5 rounded-2xl ${color} shadow-sm border border-white`}>
        <Icon className="h-6 w-6" strokeWidth={2.5} />
      </div>
      {linkTo && (
        <Link to={linkTo} className="text-xs text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 uppercase tracking-widest bg-primary-50 px-2.5 py-1 rounded-xl">
          View <ArrowRight className="h-3 w-3" strokeWidth={3} />
        </Link>
      )}
    </div>
    <h3 className="text-3xl font-black text-gray-900 mb-1">{value}</h3>
    <p className="text-sm font-bold text-gray-700">{title}</p>
    {subtitle && <p className="text-xs font-medium text-gray-600 mt-1">{subtitle}</p>}
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
      <div className="mb-8 border-b-2 border-primary-500 pb-5 inline-block w-fit min-w-full sm:min-w-[50%]">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-700 font-bold text-sm mt-1">Welcome back. Here's a quick overview of your store.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="bg-primary-100 text-primary-700"
          subtitle={`${orders.length} total orders`}
          linkTo="/admin/orders"
        />
        <StatCard
          title="Total Orders"
          value={orders.length}
          icon={ShoppingBag}
          color="bg-amber-100 text-amber-700"
          subtitle={`${stats.delivered} delivered`}
          linkTo="/admin/orders"
        />
        <StatCard
          title="Products Listed"
          value={products.length}
          icon={Box}
          color="bg-sky-100 text-sky-700"
          subtitle={`${stats.outOfStock} out of stock`}
          linkTo="/admin/products"
        />
        <StatCard
          title="Pending Orders"
          value={stats.processing}
          icon={Clock}
          color="bg-surface-200 text-gray-800"
          subtitle="Awaiting fulfillment"
          linkTo="/admin/orders"
        />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders — wide */}
        <div className="lg:col-span-2 bg-white rounded-[1.5rem] shadow-sm border-2 border-surface-300 overflow-hidden">
          <div className="px-6 py-5 border-b-2 border-surface-300 flex justify-between items-center bg-surface-50">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:text-white hover:bg-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 uppercase tracking-widest transition-colors">
              View all <ArrowRight className="h-3 w-3" strokeWidth={3} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-gray-600 text-xs font-black uppercase tracking-widest border-b-2 border-surface-300">
                  <th className="py-4 px-6">Order</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => {
                    const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.Pending;
                    const StatusIcon = cfg.icon;
                    return (
                      <tr key={order._id} className="hover:bg-surface-50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="text-sm font-black text-gray-900 font-mono bg-surface-100 w-fit px-2 py-0.5 rounded-lg border border-surface-300 mb-1">#{order._id.slice(-6).toUpperCase()}</p>
                          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-bold text-gray-900 mb-0.5">{order.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-700 font-medium">{order.items.length} items</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest border border-white ${cfg.bg}`}>
                            <StatusIcon className="h-3.5 w-3.5" strokeWidth={3} />
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-base font-black text-gray-900 text-right tracking-tight">
                          {formatCurrency(order.totalPrice)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-gray-600 text-sm font-bold">
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
          <div className="bg-white rounded-[1.5rem] shadow-sm border-2 border-surface-300 p-6 md:p-8">
            <h2 className="text-lg font-black text-gray-900 tracking-tight mb-6">Order Statuses</h2>
            <div className="space-y-4">
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                const count = orders.filter(o => o.orderStatus === status).length;
                const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                const StatusIcon = cfg.icon;
                return (
                  <div key={status} className="flex items-center gap-4">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white shadow-sm ${cfg.bg}`}>
                      <StatusIcon className="h-5 w-5" strokeWidth={2.5} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-800 font-bold">{status}</span>
                        <span className="text-gray-700 font-black text-xs">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            status === 'Delivered' ? 'bg-primary-500' :
                            status === 'Processing' ? 'bg-amber-400' :
                            status === 'Shipped' ? 'bg-blue-400' :
                            status === 'Cancelled' ? 'bg-red-400' : 'bg-gray-400'
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
          <div className="bg-white rounded-[1.5rem] shadow-sm border-2 border-surface-300 p-6 md:p-8">
            <h2 className="text-lg font-black text-gray-900 tracking-tight mb-6">Top Categories</h2>
            {stats.categories.length > 0 ? (
              <ul className="space-y-4">
                {stats.categories.map(([cat, count]) => (
                  <li key={cat} className="flex items-center justify-between pb-3 border-b border-surface-300 last:border-0 last:pb-0">
                    <span className="text-sm font-bold text-gray-800 truncate">{cat}</span>
                    <span className="text-xs font-black text-gray-800 bg-surface-100 px-3 py-1 rounded-xl border border-surface-300 shadow-sm">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 font-bold text-center py-4">No products yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
