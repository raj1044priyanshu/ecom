import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiMail, FiMapPin, FiAward, FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiPhone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance.js';
import { setUserForce } from '../features/auth/authSlice.js';

// Indian states list
const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  address: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters').regex(/^[a-zA-Z\s]+$/, 'City must contain only letters'),
  state: z.string().min(1, 'Please select a state'),
  postalCode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  country: z.string().default('India'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  isDefault: z.boolean().optional(),
});

const AddressForm = ({ existing, onSave, onCancel }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: existing ? {
      label: existing.label || 'Home',
      address: existing.address,
      city: existing.city,
      state: existing.state,
      postalCode: existing.postalCode,
      country: existing.country || 'India',
      phone: existing.phone,
      isDefault: existing.isDefault || false,
    } : { label: 'Home', country: 'India', isDefault: false },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Label */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Label</label>
          <select {...register('label')} className="input-field w-full text-sm">
            <option value="Home">🏠 Home</option>
            <option value="Office">🏢 Office</option>
            <option value="Other">📍 Other</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Mobile Number *</label>
          <input {...register('phone')} type="tel" maxLength={10} placeholder="9876543210" className={`input-field w-full text-sm ${errors.phone ? 'border-red-400' : ''}`} />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        {/* Street Address */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Street Address *</label>
          <input {...register('address')} placeholder="House no, Building, Street name" className={`input-field w-full text-sm ${errors.address ? 'border-red-400' : ''}`} />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">City *</label>
          <input {...register('city')} placeholder="Mumbai" className={`input-field w-full text-sm ${errors.city ? 'border-red-400' : ''}`} />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">State *</label>
          <select {...register('state')} className={`input-field w-full text-sm ${errors.state ? 'border-red-400' : ''}`}>
            <option value="">Select State...</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Pincode *</label>
          <input {...register('postalCode')} type="text" maxLength={6} placeholder="400001" className={`input-field w-full text-sm ${errors.postalCode ? 'border-red-400' : ''}`} />
          {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Country</label>
          <input {...register('country')} readOnly className="input-field w-full text-sm bg-gray-100 cursor-not-allowed" />
        </div>

        {/* Default checkbox */}
        <div className="sm:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="isDefault" {...register('isDefault')} className="w-4 h-4 text-primary-600 accent-primary-600" />
          <label htmlFor="isDefault" className="text-sm text-gray-600">Set as default address</label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting}
          className="btn-primary flex items-center gap-2 px-5 py-2 text-sm">
          <FiCheck /> {isSubmitting ? 'Saving...' : 'Save Address'}
        </button>
        <button type="button" onClick={onCancel}
          className="btn flex items-center gap-2 px-5 py-2 text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg">
          <FiX /> Cancel
        </button>
      </div>
    </form>
  );
};

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // null = adding new

  const handleSaveAddress = async (data) => {
    try {
      const payload = editingAddress ? { ...data, _id: editingAddress._id } : data;
      const res = await axiosInstance.post('/users/addresses', payload);
      dispatch(setUserForce(res.data.user));
      toast.success(editingAddress ? 'Address updated!' : 'Address added!');
      setShowForm(false);
      setEditingAddress(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      const res = await axiosInstance.delete(`/users/addresses/${addressId}`);
      dispatch(setUserForce(res.data.user));
      toast.success('Address removed.');
    } catch (err) {
      toast.error('Failed to remove address.');
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddress(addr);
    setShowForm(true);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <Helmet><title>My Profile | Ecom.</title></Helmet>

      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Profile Card Sidebar */}
          <div className="md:col-span-1">
            <div className="card p-6 text-center border-t-4 border-t-primary-500">
              <div className="relative inline-block mb-4">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-3xl mx-auto border-4 border-white shadow-lg">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                {user?.isVerified && (
                  <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Verified Account">
                    <FiAward className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500 mt-1 capitalize font-medium">{user?.role} Account</p>
              
              <div className="mt-6 border-t border-gray-100 pt-6 space-y-3 text-sm">
                <div className="flex items-center text-gray-600 bg-gray-50 p-2 border border-gray-100 rounded-lg">
                  <FiMail className="mr-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center text-gray-600 bg-gray-50 p-2 border border-gray-100 rounded-lg">
                    <FiPhone className="mr-3 text-gray-400 flex-shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Account Settings */}
            <div className="card p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 border-b-2 border-primary-500 pb-1 inline-block">Account Settings</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Full Name</label>
                  <p className="text-base font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">{user?.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Email Address</label>
                  <p className="text-base font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">{user?.email}</p>
                </div>
              </div>

              {!user?.isVerified && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-yellow-800">Email Verification Required</p>
                    <p className="text-sm text-yellow-700 mt-1">Please verify your email to access all features.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/verify-otp', { state: { email: user?.email } })}
                    className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-bold shadow-sm hover:bg-yellow-200"
                  >
                    Verify Now
                  </button>
                </div>
              )}
            </div>

            {/* Saved Addresses */}
            <div className="card p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 border-b-2 border-primary-500 pb-1 flex items-center">
                  <FiMapPin className="mr-2 text-primary-600" />
                  Saved Addresses
                </h3>
                {!showForm && (
                  <button onClick={handleAddNew}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors">
                    <FiPlus /> Add New
                  </button>
                )}
              </div>

              {user?.addresses?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr) => (
                    <div key={addr._id} className={`border rounded-xl p-4 bg-white relative group transition-all ${addr.isDefault ? 'border-primary-400 shadow-sm' : 'border-gray-200 hover:border-primary-300'}`}>
                      {addr.isDefault && (
                        <span className="absolute top-2 right-2 bg-primary-100 text-primary-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Default</span>
                      )}
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{addr.label}</p>
                      <address className="not-italic text-sm text-gray-600">
                        <span className="font-semibold text-gray-900 block mb-1">{user.name}</span>
                        {addr.address}<br />
                        {addr.city}, {addr.state} - {addr.postalCode}<br />
                        {addr.country}<br />
                        <span className="text-gray-500">📞 {addr.phone}</span>
                      </address>
                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditAddress(addr)}
                          className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 bg-primary-50 px-3 py-1 rounded-lg font-medium">
                          <FiEdit2 className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => handleDeleteAddress(addr._id)}
                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 bg-red-50 px-3 py-1 rounded-lg font-medium">
                          <FiTrash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !showForm && (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                    <FiMapPin className="mx-auto text-3xl text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No saved addresses yet.</p>
                    <button onClick={handleAddNew}
                      className="mt-3 text-sm font-medium text-primary-600 hover:underline">
                      + Add your first address
                    </button>
                  </div>
                )
              )}

              {showForm && (
                <AddressForm
                  existing={editingAddress}
                  onSave={handleSaveAddress}
                  onCancel={() => { setShowForm(false); setEditingAddress(null); }}
                />
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
