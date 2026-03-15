import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp, XCircle, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance.js';
import Spinner from '../components/common/Spinner.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';

const OrderStatusIcon = ({ status }) => {
  switch (status) {
    case 'Processing': return <Clock className="h-5 w-5 text-amber-500" strokeWidth={2} />;
    case 'Shipped': return <Truck className="h-5 w-5 text-blue-500" strokeWidth={2} />;
    case 'Delivered': return <CheckCircle className="h-5 w-5 text-primary-500" strokeWidth={2} />;
    case 'Cancelled': return <XCircle className="h-5 w-5 text-red-500" strokeWidth={2} />;
    default: return <Package className="h-5 w-5 text-gray-700" strokeWidth={2} />;
  }
};

const OrderStatusBadge = ({ status }) => {
  let styles = '';
  switch (status) {
    case 'Processing': styles = 'bg-amber-100 text-amber-800 border-amber-200'; break;
    case 'Shipped': styles = 'bg-blue-100 text-blue-800 border-blue-200'; break;
    case 'Out for Delivery': styles = 'bg-indigo-100 text-indigo-800 border-indigo-200'; break;
    case 'Delivered': styles = 'bg-primary-100 text-primary-800 border-primary-200'; break;
    case 'Cancelled': styles = 'bg-red-100 text-red-800 border-red-200'; break;
    default: styles = 'bg-surface-100 text-gray-800 border-surface-300'; break;
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold border ${styles}`}>
      {status}
    </span>
  );
};

const OrderTracker = ({ status, date }) => {
  const steps = [
    { id: 'Processing', label: 'Order Processing', icon: Clock },
    { id: 'Shipped', label: 'Shipped', icon: Truck },
    { id: 'Out for Delivery', label: 'Out for Delivery', icon: Package },
    { id: 'Delivered', label: 'Delivered', icon: CheckCircle }
  ];

  let currentStepIndex = 0;
  if (status === 'Shipped') currentStepIndex = 1;
  if (status === 'Out for Delivery') currentStepIndex = 2;
  if (status === 'Delivered') currentStepIndex = 3;
  
  if (status === 'Cancelled') {
    return (
      <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center shadow-inner">
        <XCircle className="text-red-500 mr-2.5 h-6 w-6" strokeWidth={2.5} />
        <span className="text-red-800 font-bold">This order was cancelled.</span>
      </div>
    );
  }

  return (
    <div className="mb-10 mt-6 px-4 sm:px-8">
      <div className="relative">
        {/* Background Track */}
        <div className="absolute top-5 left-0 w-full h-1.5 bg-surface-100 rounded-full z-0"></div>
        
        {/* Active Track */}
        <div 
          className="absolute top-5 left-0 h-1.5 bg-primary-500 rounded-full z-0 transition-all duration-700 ease-in-out shadow-sm shadow-primary-500/50"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        ></div>
        
        <div className="flex justify-between w-full relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center mb-3 border-4 border-white shadow-md transition-all duration-500 ${isCompleted ? 'bg-primary-500 text-white shadow-primary-500/30' : 'bg-surface-100 text-gray-600'}`}>
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div className={`text-xs sm:text-sm font-black text-center ${isCompleted ? 'text-gray-900' : 'text-gray-600'}`}>
                  {step.label}
                </div>
                {isCurrent && status !== 'Delivered' && (
                  <p className="text-[10px] sm:text-xs text-primary-600 font-bold mt-1.5 uppercase tracking-widest animate-pulse">
                    Current Status
                  </p>
                )}
                {isCompleted && status === 'Delivered' && index === 3 && (
                  <p className="text-[10px] sm:text-xs text-primary-600 font-bold mt-1.5">
                    {date ? format(new Date(date), 'MMM dd, yyyy') : 'Completed'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const location = useLocation();
  const queryClient = useQueryClient();
  const isNewOrder = location.state?.newOrder;

  const { data: ordersData, isLoading, isError } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const res = await axiosInstance.get('/orders/my-orders');
      return res.data;
    },
  });

  const myOrders = ordersData?.orders || [];

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      await axiosInstance.put(`/orders/${orderId}/cancel`);
    },
    onSuccess: () => {
      toast.success('Order cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  });

  const toggleOrderExpand = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleCancelOrder = (e, orderId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  return (
    <div className="section-cream min-h-screen py-8 sm:py-12">
      <Helmet>
        <title>My Orders | Ecom.</title>
      </Helmet>

      <div className="container-custom max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b-2 border-primary-500 inline-block w-fit min-w-full">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Order History & Tracking</h1>
            <p className="mt-2 text-sm font-bold text-gray-700">
              Check the status of recent orders, track shipments, and request cancellations
            </p>
          </div>
        </div>

        {isNewOrder && (
          <div className="mb-10 p-5 bg-primary-50 border border-primary-200 rounded-2xl flex items-start shadow-sm">
            <CheckCircle className="text-primary-600 mt-0.5 mr-3 h-6 w-6 flex-shrink-0" strokeWidth={2.5} />
            <div>
              <h3 className="text-base font-black text-primary-900 tracking-tight">Order successfully placed!</h3>
              <p className="mt-1 text-sm font-medium text-primary-800">
                Thank you for your purchase. We've sent a confirmation email with details.
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Spinner className="h-12 w-12 text-primary-600" />
          </div>
        ) : isError ? (
          <div className="card p-10 text-center bg-red-50 border border-red-200 rounded-[2rem] shadow-sm">
            <p className="text-red-600 font-bold">Failed to load orders. Please try again later.</p>
          </div>
        ) : myOrders.length === 0 ? (
          <div className="card p-16 text-center border-2 border-surface-300 border-dashed rounded-[2rem] bg-surface-50/50 shadow-none">
            <div className="w-24 h-24 bg-white shadow-sm rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-surface-300">
              <Package className="h-10 w-10 text-gray-600" strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">No orders found</h2>
            <p className="text-gray-700 font-medium mb-8">You haven't placed any orders yet.</p>
            <Link to="/products" className="btn-primary py-3.5 px-8 shadow-lg shadow-primary-500/20 text-base">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {myOrders.map((order) => {
              const orderIdSnippet = order._id.substring(order._id.length - 8).toUpperCase();
              return (
                <div key={order._id} className={`card overflow-hidden rounded-[2rem] border-2 transition-all duration-300 ${expandedOrders.has(order._id) ? 'border-primary-500 shadow-xl shadow-surface-200/50' : 'border-surface-300 shadow-sm hover:border-primary-300'}`}>
                  {/* Order Header - Always visible */}
                  <div 
                    className="bg-surface-50 px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer hover:bg-surface-100 transition-colors"
                    onClick={() => toggleOrderExpand(order._id)}
                  >
                    <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 sm:mb-0">
                      <div>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Order Placed</p>
                        <p className="text-sm font-bold text-gray-900 mt-1 pb-1 border-b border-surface-300 w-fit">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Total</p>
                        <p className="text-sm font-black text-gray-900 mt-1">{formatCurrency(order.totalPrice)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Order #</p>
                        <p className="text-sm font-bold text-gray-900 mt-1 truncate font-mono bg-white px-2 py-0.5 rounded-md border border-surface-300 w-fit">{orderIdSnippet}</p>
                      </div>
                      <div className="col-span-2 md:col-span-2 flex items-center justify-end sm:justify-start gap-4">
                        <OrderStatusBadge status={order.orderStatus} />
                      </div>
                    </div>
                    <div className="text-gray-700 p-2 ml-4 flex gap-2 bg-white rounded-xl border border-surface-300 shadow-sm">
                       {expandedOrders.has(order._id) ? <ChevronUp className="h-5 w-5" strokeWidth={2.5} /> : <ChevronDown className="h-5 w-5" strokeWidth={2.5} />}
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {expandedOrders.has(order._id) && (
                    <div className="border-t-2 border-surface-300 bg-white p-5 sm:p-8">
                      
                      <OrderTracker status={order.orderStatus} date={order.deliveredAt} />

                      {/* Smart Actions Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface-50 border border-surface-300 rounded-2xl p-5 mb-8 shadow-inner">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[1rem] bg-white border border-surface-300 shadow-sm flex items-center justify-center text-gray-800">
                            <Package className="h-6 w-6" strokeWidth={2} />
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 text-sm tracking-tight">Order Management</h4>
                            <p className="text-gray-700 font-medium text-xs mt-1">Need help with order {orderIdSnippet}?</p>
                          </div>
                        </div>
                        <div className="mt-5 sm:mt-0 flex flex-wrap gap-3">
                          {order.orderStatus === 'Shipped' && (
                            <button className="btn-secondary px-5 py-2.5 text-sm bg-white hover:bg-surface-50 text-gray-800 border-surface-300 shadow-sm" onClick={(e) => { e.stopPropagation(); toast.success(`Real-time tracking is currently active above.`); }}>
                              <Truck className="mr-2 h-4 w-4" strokeWidth={2.5} /> Live Tracking
                            </button>
                          )}
                          {order.orderStatus === 'Processing' && (
                            <button 
                              className="btn-secondary px-5 py-2.5 text-sm bg-white hover:bg-red-50 text-red-600 border-red-200 shadow-sm transition-colors hover:text-red-700 hover:border-red-300"
                              onClick={(e) => handleCancelOrder(e, order._id)}
                              disabled={cancelOrderMutation.isPending}
                            >
                              <XCircle className="mr-2 h-4 w-4" strokeWidth={2.5} /> {cancelOrderMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                          )}
                          {(order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') && (
                            <button className="btn-secondary px-5 py-2.5 text-sm bg-gray-900 border-gray-900 text-white hover:bg-gray-800 shadow-md" onClick={(e) => { e.stopPropagation(); toast.success('Our support team has been notified. We will email you shortly.'); }}>
                              Contact Support
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar lg:col-span-3">
                        <h4 className="sr-only">Items</h4>
                        <ul className="divide-y divide-surface-100 border-b border-surface-300 mb-8">
                          {order.items?.map((item, index) => (
                            <li key={`${order._id}-${item?.product}-${index}`} className="py-5 flex">
                              <img
                                src={item.image || 'https://via.placeholder.com/150'}
                                alt={item.name}
                                className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-[1rem] border border-surface-300 bg-surface-50 shadow-sm"
                              />
                              <div className="ml-5 flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-start">
                                  <h5 className="text-sm font-bold text-gray-900 line-clamp-2 pr-6 leading-snug">
                                    <Link to={`/products/${item.product}`} className="hover:text-primary-600 transition-colors">
                                      {item.name}
                                    </Link>
                                  </h5>
                                  <p className="text-base font-black text-gray-900 ml-4 bg-surface-50 px-3 py-1.5 rounded-xl border border-surface-300 shadow-sm whitespace-nowrap">{formatCurrency(item.price)}</p>
                                </div>
                                <p className="mt-2 text-xs font-bold text-gray-700 uppercase tracking-wider">Qty: {item.quantity}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:col-span-3">
                        {/* Shipping Info */}
                        <div className="bg-surface-50 p-6 rounded-2xl border border-surface-300">
                          <h4 className="text-sm flex items-center font-black text-gray-900 mb-4 tracking-wide uppercase border-b border-surface-300 pb-3">
                            <Truck className="mr-2 text-primary-500 h-5 w-5" strokeWidth={2.5} />
                            Delivery Address
                          </h4>
                          {order.shippingAddress ? (
                            <address className="not-italic text-sm text-gray-800 font-medium leading-relaxed">
                              <span className="block font-black text-gray-900 text-base mb-1.5">{order.shippingAddress.fullName || 'Recipient'}</span>
                              {order.shippingAddress.address}<br />
                              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                              <span className="font-bold text-gray-600 block mt-1">{order.shippingAddress.country}</span>
                              {order.shippingAddress.phone && <span className="block mt-3 pt-3 border-t border-surface-300 font-bold text-gray-800 flex items-center"><TrendingUp className="h-3 w-3 mr-2 text-primary-500" /> Phone: {order.shippingAddress.phone}</span>}
                            </address>
                          ) : (
                            <p className="text-sm font-medium text-gray-700 italic">No address provided</p>
                          )}
                        </div>

                        {/* Payment Info */}
                        <div className="bg-surface-50 p-6 rounded-2xl border border-surface-300">
                          <h4 className="text-sm flex items-center font-black text-gray-900 mb-4 tracking-wide uppercase border-b border-surface-300 pb-3">
                            <CheckCircle className="mr-2 text-primary-500 h-5 w-5" strokeWidth={2.5} />
                            Payment Details
                          </h4>
                          <div className="text-sm text-gray-800 font-medium space-y-2">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-bold">Status</span>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${order.paymentInfo?.status === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                {order.paymentInfo?.status || 'Pending'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Subtotal</span>
                              <span className="font-bold text-gray-900">{formatCurrency(order.itemsPrice || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Shipping</span>
                              <span className="font-bold text-gray-900">{formatCurrency(order.shippingPrice || 0)}</span>
                            </div>
                            <div className="flex justify-between pt-4 mt-3 border-t border-surface-300">
                              <span className="font-black text-gray-900 text-base">Total Charged</span>
                              <span className="font-black text-gray-900 text-xl tracking-tight bg-white px-3 py-1 rounded-xl border border-surface-300 shadow-sm">{formatCurrency(order.totalPrice)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
