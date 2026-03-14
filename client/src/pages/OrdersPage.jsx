import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiChevronDown, FiChevronUp, FiXCircle, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance.js';
import Spinner from '../components/common/Spinner.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';

const OrderStatusIcon = ({ status }) => {
  switch (status) {
    case 'Processing': return <FiClock className="h-5 w-5 text-yellow-500" />;
    case 'Shipped': return <FiTruck className="h-5 w-5 text-blue-500" />;
    case 'Delivered': return <FiCheckCircle className="h-5 w-5 text-green-500" />;
    case 'Cancelled': return <FiXCircle className="h-5 w-5 text-red-500" />;
    default: return <FiPackage className="h-5 w-5 text-gray-500" />;
  }
};

const OrderStatusBadge = ({ status }) => {
  let styles = '';
  switch (status) {
    case 'Processing': styles = 'bg-yellow-100 text-yellow-800 border-yellow-200'; break;
    case 'Shipped': styles = 'bg-blue-100 text-blue-800 border-blue-200'; break;
    case 'Out for Delivery': styles = 'bg-indigo-100 text-indigo-800 border-indigo-200'; break;
    case 'Delivered': styles = 'bg-green-100 text-green-800 border-green-200'; break;
    case 'Cancelled': styles = 'bg-red-100 text-red-800 border-red-200'; break;
    default: styles = 'bg-gray-100 text-gray-800 border-gray-200'; break;
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles}`}>
      {status}
    </span>
  );
};

const OrderTracker = ({ status, date }) => {
  const steps = [
    { id: 'Processing', label: 'Order Processing', icon: FiClock },
    { id: 'Shipped', label: 'Shipped', icon: FiTruck },
    { id: 'Out for Delivery', label: 'Out for Delivery', icon: FiPackage },
    { id: 'Delivered', label: 'Delivered', icon: FiCheckCircle }
  ];

  let currentStepIndex = 0;
  if (status === 'Shipped') currentStepIndex = 1;
  if (status === 'Out for Delivery') currentStepIndex = 2;
  if (status === 'Delivered') currentStepIndex = 3;
  
  if (status === 'Cancelled') {
    return (
      <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center">
        <FiXCircle className="text-red-500 mr-2 h-5 w-5" />
        <span className="text-red-700 font-medium">This order was cancelled.</span>
      </div>
    );
  }

  return (
    <div className="mb-10 mt-6 px-4 sm:px-8">
      <div className="relative">
        {/* Background Track */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full z-0"></div>
        
        {/* Active Track */}
        <div 
          className="absolute top-5 left-0 h-1 bg-green-500 rounded-full z-0 transition-all duration-700 ease-in-out"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        ></div>
        
        <div className="flex justify-between w-full relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 border-4 border-white shadow-sm transition-colors duration-500 ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`text-xs sm:text-sm font-bold text-center ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </div>
                {isCurrent && status !== 'Delivered' && (
                  <p className="text-[10px] sm:text-xs text-green-600 font-semibold mt-1 uppercase tracking-wider animate-pulse">
                    Current Status
                  </p>
                )}
                {isCompleted && status === 'Delivered' && index === 3 && (
                  <p className="text-[10px] sm:text-xs text-green-600 font-semibold mt-1">
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
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
      <Helmet>
        <title>My Orders | Ecom.</title>
      </Helmet>

      <div className="container-custom max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order History & Tracking</h1>
          <p className="mt-2 sm:mt-0 text-sm text-gray-500">
            Check the status of recent orders, track shipments, and request cancellations
          </p>
        </div>

        {isNewOrder && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start">
            <FiCheckCircle className="text-green-500 mt-0.5 mr-3 h-5 w-5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Order successfully placed!</h3>
              <p className="mt-1 text-sm text-green-700">
                Thank you for your purchase. We've sent a confirmation email with details.
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-10 w-10 text-primary-600" />
          </div>
        ) : isError ? (
          <div className="card p-8 text-center bg-red-50 border border-red-100">
            <p className="text-red-600">Failed to load orders. Please try again later.</p>
          </div>
        ) : myOrders.length === 0 ? (
          <div className="card p-12 text-center border border-gray-100 border-dashed">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <Link to="/products" className="btn-primary py-3 px-6">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {myOrders.map((order) => {
              const orderIdSnippet = order._id.substring(order._id.length - 8).toUpperCase();
              return (
                <div key={order._id} className="card overflow-hidden">
                  {/* Order Header - Always visible */}
                  <div 
                    className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleOrderExpand(order._id)}
                  >
                    <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 sm:mb-0">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Placed</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">{formatCurrency(order.totalPrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order #</p>
                        <p className="text-sm font-medium text-gray-900 mt-1 truncate">{orderIdSnippet}</p>
                      </div>
                      <div className="col-span-2 md:col-span-2 flex items-center justify-end sm:justify-start gap-4">
                        <OrderStatusBadge status={order.orderStatus} />
                      </div>
                    </div>
                    <div className="text-gray-400 p-2 ml-4 flex gap-2">
                       {expandedOrders.has(order._id) ? <FiChevronUp className="h-5 w-5" /> : <FiChevronDown className="h-5 w-5" />}
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {expandedOrders.has(order._id) && (
                    <div className="border-t border-gray-100 bg-white p-4 sm:p-6 shadow-inner">
                      
                      <OrderTracker status={order.orderStatus} date={order.deliveredAt} />

                      {/* Smart Actions Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-4 mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600">
                            <FiPackage className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">Order Management</h4>
                            <p className="text-gray-500 text-xs mt-0.5">Need help with order {orderIdSnippet}?</p>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex gap-2">
                          {order.orderStatus === 'Shipped' && (
                            <button className="btn-secondary px-4 py-2 text-sm bg-white hover:bg-gray-50 text-gray-700 border-gray-200" onClick={(e) => { e.stopPropagation(); toast.success(`Real-time tracking is currently active above.`); }}>
                              <FiTruck className="mr-2" /> Live Tracking
                            </button>
                          )}
                          {order.orderStatus === 'Processing' && (
                            <button 
                              className="btn-secondary px-4 py-2 text-sm bg-white hover:bg-red-50 text-red-600 border-red-200"
                              onClick={(e) => handleCancelOrder(e, order._id)}
                              disabled={cancelOrderMutation.isPending}
                            >
                              <FiXCircle className="mr-2" /> {cancelOrderMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                          )}
                          {(order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') && (
                            <button className="btn-secondary px-4 py-2 text-sm bg-white hover:bg-gray-100 border-gray-200" onClick={(e) => { e.stopPropagation(); toast.success('Our support team has been notified. We will email you shortly.'); }}>
                              Contact Support
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        <h4 className="sr-only">Items</h4>
                        <ul className="divide-y divide-gray-100 border-b border-gray-100 mb-6">
                          {order.items?.map((item, index) => (
                            <li key={`${order._id}-${item?.product}-${index}`} className="py-4 flex">
                              <img
                                src={item.image || 'https://via.placeholder.com/150'}
                                alt={item.name}
                                className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-lg border border-gray-200"
                              />
                              <div className="ml-4 flex-1 flex flex-col justify-center">
                                <div className="flex justify-between">
                                  <h5 className="text-sm font-medium text-gray-900 line-clamp-1 pr-4">
                                    <Link to={`/products/${item.product}`} className="hover:text-primary-600">
                                      {item.name}
                                    </Link>
                                  </h5>
                                  <p className="text-sm font-bold text-gray-900 ml-4">{formatCurrency(item.price)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Shipping Info */}
                        <div>
                          <h4 className="text-sm flex items-center font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">
                            <FiTruck className="mr-2 text-gray-400" />
                            Delivery Address
                          </h4>
                          {order.shippingAddress ? (
                            <address className="not-italic text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <span className="block font-medium text-gray-900 mb-1">{order.shippingAddress.fullName || 'Recipient'}</span>
                              {order.shippingAddress.address}<br />
                              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                              {order.shippingAddress.country}<br />
                              {order.shippingAddress.phone && <span className="block mt-2 pt-2 border-t border-gray-200">Phone: {order.shippingAddress.phone}</span>}
                            </address>
                          ) : (
                            <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">No address provided</p>
                          )}
                        </div>

                        {/* Payment Info */}
                        <div>
                          <h4 className="text-sm flex items-center font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">
                            <FiCheckCircle className="mr-2 text-gray-400" />
                            Payment Details
                          </h4>
                          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between mb-2">
                              <span>Status</span>
                              <span className={order.paymentInfo?.status === 'paid' ? 'text-green-600 font-medium capitalize' : 'text-yellow-600 font-medium capitalize'}>
                                {order.paymentInfo?.status || 'Pending'}
                              </span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-500">Subtotal</span>
                              <span className="font-medium">{formatCurrency(order.itemsPrice || 0)}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-500">Shipping</span>
                              <span className="font-medium">{formatCurrency(order.shippingPrice || 0)}</span>
                            </div>
                            <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                              <span className="font-semibold text-gray-900">Total Charged</span>
                              <span className="font-bold text-gray-900">{formatCurrency(order.totalPrice)}</span>
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
