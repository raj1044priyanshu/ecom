import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance.js';
import Spinner from '../../components/common/Spinner.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FiSearch, FiChevronDown, FiChevronUp, FiCheckCircle, FiPackage, FiClock, FiXCircle } from 'react-icons/fi';

const ORDER_STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const STATUS_CONFIG = {
  Delivered:  { bg: 'bg-green-100 text-green-700 border-green-200',   icon: FiCheckCircle },
  Processing: { bg: 'bg-blue-100 text-blue-700 border-blue-200',      icon: FiClock },
  Shipped:    { bg: 'bg-purple-100 text-purple-700 border-purple-200', icon: FiPackage },
  'Out for Delivery': { bg: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: FiPackage },
  Cancelled:  { bg: 'bg-red-100 text-red-700 border-red-200',         icon: FiXCircle },
  Pending:    { bg: 'bg-amber-100 text-amber-700 border-amber-200',    icon: FiClock },
};

const AdminOrdersPage = () => {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const res = await axiosInstance.get('/orders');
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await axiosInstance.put(`/orders/${id}/status`, { status });
      return res.data;
    },
    onMutate: ({ id }) => setUpdatingId(id),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
    onSettled: () => setUpdatingId(null),
  });

  const allOrders = data?.orders || [];

  const filteredOrders = useMemo(() => {
    return allOrders.filter(order => {
      const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        order._id.toLowerCase().includes(q) ||
        (order.user?.name || '').toLowerCase().includes(q) ||
        (order.user?.email || '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [allOrders, statusFilter, search]);

  const counts = useMemo(() => {
    const map = {};
    allOrders.forEach(o => { map[o.orderStatus] = (map[o.orderStatus] || 0) + 1; });
    return map;
  }, [allOrders]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and update customer orders.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filter Tabs + Search */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-50/50">
          {/* Status tabs */}
          <div className="flex flex-wrap gap-2">
            {ORDER_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                  statusFilter === s
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {s} {s !== 'All' && counts[s] ? `(${counts[s]})` : ''}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by ID, name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-8 w-8 text-primary-600" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 px-5 font-medium w-8"></th>
                  <th className="py-3 px-5 font-medium">Order</th>
                  <th className="py-3 px-5 font-medium">Customer</th>
                  <th className="py-3 px-5 font-medium">Date</th>
                  <th className="py-3 px-5 font-medium">Total</th>
                  <th className="py-3 px-5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.Pending;
                    const isExpanded = expandedId === order._id;
                    const isLocked = order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled';

                    return (
                      <>
                        <tr
                          key={order._id}
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : order._id)}
                        >
                          <td className="py-3 px-5">
                            {isExpanded ? (
                              <FiChevronUp className="text-gray-400" />
                            ) : (
                              <FiChevronDown className="text-gray-400" />
                            )}
                          </td>
                          <td className="py-3 px-5">
                            <p className="text-sm font-semibold text-gray-900">#{order._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                          </td>
                          <td className="py-3 px-5">
                            <p className="text-sm text-gray-800 font-medium">{order.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-400">{order.user?.email}</p>
                          </td>
                          <td className="py-3 px-5 text-sm text-gray-500">
                            {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                            <div className="text-xs text-gray-400">{format(new Date(order.createdAt), 'hh:mm a')}</div>
                          </td>
                          <td className="py-3 px-5 text-sm font-bold text-gray-900">
                            {formatCurrency(order.totalPrice)}
                          </td>
                          <td className="py-3 px-5" onClick={e => e.stopPropagation()}>
                            <select
                              disabled={updatingId === order._id || isLocked}
                              value={order.orderStatus}
                              onChange={(e) => updateStatusMutation.mutate({ id: order._id, status: e.target.value })}
                              className={`text-xs rounded-lg px-2.5 py-1.5 border font-medium cursor-pointer ${cfg.bg} ${isLocked ? 'opacity-60 cursor-not-allowed' : ''} focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all`}
                            >
                              {ORDER_STATUSES.filter(s => s !== 'All').map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                            {updatingId === order._id && (
                              <Spinner className="inline-block ml-2 h-3.5 w-3.5 text-primary-600" />
                            )}
                          </td>
                        </tr>

                        {/* Expanded Order Items Row */}
                        {isExpanded && (
                          <tr key={`${order._id}-expanded`} className="bg-gray-50/70">
                            <td></td>
                            <td colSpan="5" className="px-5 py-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Items</p>
                                  <ul className="space-y-2">
                                    {order.items.map((item, i) => (
                                      <li key={i} className="flex items-center gap-3">
                                        <img src={item.image || 'https://placehold.co/40x40'} alt={item.name} className="w-9 h-9 rounded-lg object-cover border border-gray-200" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                                          <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</p>
                                  {order.shippingAddress ? (
                                    <div className="text-sm text-gray-600 space-y-0.5">
                                      <p>{order.shippingAddress.address}</p>
                                      <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                      <p>{order.shippingAddress.country}</p>
                                    </div>
                                  ) : <p className="text-sm text-gray-400">No address available</p>}

                                  <div className="mt-3 space-y-1 text-xs text-gray-500">
                                    <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.itemsPrice)}</span></div>
                                    <div className="flex justify-between"><span>Tax (18%)</span><span>{formatCurrency(order.taxPrice)}</span></div>
                                    <div className="flex justify-between"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : formatCurrency(order.shippingPrice)}</span></div>
                                    <div className="flex justify-between font-bold text-gray-800 pt-1 border-t border-gray-200"><span>Total</span><span>{formatCurrency(order.totalPrice)}</span></div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-gray-400 text-sm">
                      {search || statusFilter !== 'All' ? 'No orders match your filters.' : 'No orders found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
