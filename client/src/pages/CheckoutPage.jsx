import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { FiCheckCircle, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

import axiosInstance from '../api/axiosInstance.js';
import { clearCart } from '../features/cart/cartSlice.js';
import Spinner from '../components/common/Spinner.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';

const shippingSchema = z.object({
  address: z.string().min(5, 'Address is too short'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(4, 'Valid postal code required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().min(10, 'Valid phone number required'),
});

const CheckoutPage = () => {
  const { items, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      address: user?.addresses?.[0]?.address || '',
      city: user?.addresses?.[0]?.city || '',
      state: user?.addresses?.[0]?.state || '',
      postalCode: user?.addresses?.[0]?.postalCode || '',
      country: user?.addresses?.[0]?.country || 'India',
      phone: user?.phone || '',
    }
  });

  const handlePayment = async (shippingData) => {
    setProcessing(true);
    try {
      const orderRes = await axiosInstance.post('/orders', {
        shippingAddress: shippingData
      });
      
      if (orderRes.data.success) {
        toast.success('Order placed successfully!');
        dispatch(clearCart());
        queryClient.invalidateQueries({ queryKey: ['myOrders'] });
        queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
        navigate('/orders', { replace: true, state: { newOrder: true } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error placing order');
      setProcessing(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <Helmet>
        <title>Checkout | Ecom.</title>
      </Helmet>

      <div className="container-custom max-w-6xl">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Checkout</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          
          {/* Form Section */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-primary-100 text-primary-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                Shipping Information
              </h2>
              
              <form id="checkout-form" onSubmit={handleSubmit(handlePayment)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      className={`input-field ${errors.address ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      {...register('address')}
                    />
                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      className={`input-field ${errors.city ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      {...register('city')}
                    />
                    {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                    <input
                      type="text"
                      className={`input-field ${errors.state ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      {...register('state')}
                    />
                    {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      className={`input-field ${errors.postalCode ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      {...register('postalCode')}
                    />
                    {errors.postalCode && <p className="mt-1 text-xs text-red-500">{errors.postalCode.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      className={`input-field ${errors.country ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      {...register('country')}
                    />
                    {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      className={`input-field ${errors.phone ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      {...register('phone')}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 mt-8 lg:mt-0">
            <div className="card p-6 sm:p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-primary-100 text-primary-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                Order Summary
              </h2>

              <ul className="divide-y divide-gray-100 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {items.filter(item => item && item.product).map((item) => (
                  <li key={item.product._id} className="py-4 flex">
                    <div className="w-16 h-16 border border-gray-100 rounded-lg overflow-hidden bg-white">
                      <img src={item.product.images[0]?.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-4 flex-1 flex justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 pb-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-200 pt-6 mt-6 space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <p>Subtotal</p>
                  <p className="font-medium text-gray-900">{formatCurrency(totalPrice)}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <p>Shipping</p>
                  <p className="font-medium text-gray-900">{totalPrice > 500 ? 'Free' : formatCurrency(30)}</p>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-4 pb-2">
                  <p className="text-base font-bold text-gray-900">Total to pay</p>
                  <p className="text-2xl font-extrabold text-primary-600">{formatCurrency(totalPrice + (totalPrice > 500 ? 0 : 30))}</p>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={processing}
                className="w-full btn-primary py-4 text-lg mt-6 flex justify-center items-center shadow-lg shadow-primary-500/30"
              >
                {processing ? (
                  <>
                    <Spinner className="h-5 w-5 text-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiLock className="mr-2" />
                    Place Order {formatCurrency(totalPrice + (totalPrice > 500 ? 0 : 30))}
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
