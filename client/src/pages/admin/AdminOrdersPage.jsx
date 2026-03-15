import { useState, useMemo, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance.js';
import Spinner from '../../components/common/Spinner.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Search, ChevronDown, ChevronUp, CheckCircle, Package, Clock, XCircle } from 'lucide-react';

const ORDER_STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const STATUS_CONFIG = {
  Delivered:  { bg: 'bg-primary-100 text-primary-700 border-primary-200',   icon: CheckCircle },
  Processing: { bg: 'bg-amber-100 text-amber-700 border-amber-200',      icon: Clock },
  Shipped:    { bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
  'Out for Delivery': { bg: 'bg-sky-100 text-sky-700 border-sky-200', icon: Package },
  Cancelled:  { bg: 'bg-red-100 text-red-700 border-red-200',         icon: XCircle },
  Pending:    { bg: 'bg-surface-100 text-gray-800 border-surface-300',    icon: Clock },
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
      <div className="mb-8 border-b-2 border-primary-500 pb-5 inline-block w-fit min-w-full sm:min-w-[50%]">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Orders</h1>
        <p className="text-gray-700 text-sm mt-1 font-bold">Manage and update customer orders.</p>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-sm border-2 border-surface-300 overflow-hidden">
        {/* Filter Tabs + Search */}
        <div className="p-5 border-b-2 border-surface-300 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between bg-surface-50">
          {/* Status tabs */}
          <div className="flex flex-wrap gap-2">
            {ORDER_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm ${
                  statusFilter === s
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-800 border-surface-300 hover:border-primary-400 hover:text-primary-700'
                }`}
              >
                {s} {s !== 'All' && counts[s] ? `(${counts[s]})` : ''}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-72 flex-shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 h-4 w-4" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search by ID, name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm font-bold border-2 border-surface-300 rounded-xl focus:outline-none focus:ring-0 focus:border-primary-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner className="h-10 w-10 text-primary-600" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-600 text-xs font-black uppercase tracking-widest border-b-2 border-surface-300">
                  <th className="py-4 px-6 w-8"></th>
                  <th className="py-4 px-6">Order</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Total</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.Pending;
                    const isExpanded = expandedId === order._id;
                    const isLocked = updatingId === order._id;

                    return (
                      <Fragment key={order._id}>
                        <tr
                          className="border-b border-surface-300 hover:bg-surface-50 transition-colors cursor-pointer group"
                          onClick={() => setExpandedId(isExpanded ? null : order._id)}
                        >
                          <td className="py-4 px-6">
                            <div className="bg-white border rounded-lg p-1 group-hover:border-primary-300 transition-colors">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-700" strokeWidth={3} />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-700" strokeWidth={3} />
                            )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-black text-gray-900 font-mono bg-surface-100 w-fit px-2 py-0.5 rounded-lg border border-surface-300 mb-1">#{order._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-900 font-bold mb-0.5">{order.user?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-gray-700 font-bold tracking-wider">{order.user?.email}</p>
                          </td>
                          <td className="py-4 px-6 text-sm">
                            <p className="font-bold text-gray-800">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-0.5">{format(new Date(order.createdAt), 'hh:mm a')}</p>
                          </td>
                          <td className="py-4 px-6 text-base font-black text-gray-900 tracking-tight">
                            {formatCurrency(order.totalPrice)}
                          </td>
                          <td className="py-4 px-6" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                            <select
                              disabled={updatingId === order._id || isLocked}
                              value={order.orderStatus}
                              onChange={(e) => updateStatusMutation.mutate({ id: order._id, status: e.target.value })}
                              className={`text-xs uppercase tracking-widest rounded-xl px-3 py-1.5 border-2 font-black cursor-pointer shadow-sm ${cfg.bg} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''} focus:outline-none focus:ring-0 focus:border-gray-900 transition-all`}
                            >
                              {ORDER_STATUSES.filter(s => s !== 'All').map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                            {updatingId === order._id && (
                              <Spinner className="h-4 w-4 text-primary-600" />
                            )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Order Items Row */}
                        {isExpanded && (
                          <tr key={`${order._id}-expanded`} className="bg-surface-50 border-b-4 border-surface-300 shadow-inner">
                            <td></td>
                            <td colSpan="5" className="px-6 py-5">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 border-b border-surface-300 pb-2">Order Items</p>
                                  <ul className="space-y-3">
                                    {order.items.map((item, i) => (
                                      <li key={i} className="flex items-center gap-4">
                                        <img src={item.image || 'https://placehold.co/40x40'} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-surface-300 bg-white shadow-sm" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-bold text-gray-900 truncate mb-0.5">{item.name}</p>
                                          <p className="text-xs font-black text-gray-700 uppercase tracking-widest">Qty: {item.quantity}  <span className="text-surface-300 mx-1">|</span>  <span className="text-gray-800">{formatCurrency(item.price)}</span></p>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 border-b border-surface-300 pb-2">Shipping Details</p>
                                  {order.shippingAddress ? (
                                    <div className="text-sm font-bold text-gray-800 space-y-1 mb-4 bg-white p-3 rounded-xl border border-surface-300 shadow-sm">
                                      <p className="text-gray-900 mb-1">{order.shippingAddress.address}</p>
                                      <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                      <p className="text-gray-600 font-medium">{order.shippingAddress.country}</p>
                                    </div>
                                  ) : <p className="text-sm font-medium text-gray-600 italic mb-4">No address available</p>}

                                  <div className="space-y-2 text-sm font-bold text-gray-700 bg-white p-4 rounded-xl border border-surface-300 shadow-sm">
                                    <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.itemsPrice)}</span></div>
                                    <div className="flex justify-between"><span>Tax (18%)</span><span>{formatCurrency(order.taxPrice)}</span></div>
                                    <div className="flex justify-between"><span>Shipping</span><span className={order.shippingPrice === 0 ? 'text-primary-600' : ''}>{order.shippingPrice === 0 ? 'Free' : formatCurrency(order.shippingPrice)}</span></div>
                                    <div className="flex justify-between font-black text-gray-900 text-base pt-3 mt-1 border-t-2 border-surface-300 tracking-tight"><span>Total</span><span>{formatCurrency(order.totalPrice)}</span></div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-gray-600 font-bold text-base">
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
