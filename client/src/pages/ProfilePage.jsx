import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { User, Mail, MapPin, Award, Plus, Trash2, Edit2, Check, X, Phone } from 'lucide-react';
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
    <form onSubmit={handleSubmit(onSave)} className="bg-surface-50 border border-surface-300 rounded-2xl p-6 space-y-5 mt-6 shadow-inner">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Label */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5 ml-1">Label</label>
          <select {...register('label')} className="input-field w-full text-sm font-medium shadow-sm">
            <option value="Home">Home</option>
            <option value="Office">Office</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5 ml-1">Mobile Number *</label>
          <input {...register('phone')} type="tel" maxLength={10} placeholder="9876543210" className={`input-field w-full text-sm shadow-sm ${errors.phone ? 'border-red-400 ring-2 ring-red-100' : ''}`} />
          {errors.phone && <p className="text-red-500 font-bold text-xs mt-1.5 ml-1">{errors.phone.message}</p>}
        </div>

        {/* Street Address */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5 ml-1">Street Address *</label>
          <input {...register('address')} placeholder="House no, Building, Street name" className={`input-field w-full text-sm shadow-sm ${errors.address ? 'border-red-400 ring-2 ring-red-100' : ''}`} />
          {errors.address && <p className="text-red-500 font-bold text-xs mt-1.5 ml-1">{errors.address.message}</p>}
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5 ml-1">City *</label>
          <input {...register('city')} placeholder="Mumbai" className={`input-field w-full text-sm shadow-sm ${errors.city ? 'border-red-400 ring-2 ring-red-100' : ''}`} />
          {errors.city && <p className="text-red-500 font-bold text-xs mt-1.5 ml-1">{errors.city.message}</p>}
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5 ml-1">State *</label>
          <select {...register('state')} className={`input-field w-full text-sm font-medium shadow-sm ${errors.state ? 'border-red-400 ring-2 ring-red-100' : ''}`}>
            <option value="">Select State...</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <p className="text-red-500 font-bold text-xs mt-1.5 ml-1">{errors.state.message}</p>}
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5 ml-1">Pincode *</label>
          <input {...register('postalCode')} type="text" maxLength={6} placeholder="400001" className={`input-field w-full text-sm shadow-sm ${errors.postalCode ? 'border-red-400 ring-2 ring-red-100' : ''}`} />
          {errors.postalCode && <p className="text-red-500 font-bold text-xs mt-1.5 ml-1">{errors.postalCode.message}</p>}
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5 ml-1">Country</label>
          <input {...register('country')} readOnly className="input-field w-full text-sm bg-surface-100 cursor-not-allowed font-bold text-gray-600" />
        </div>

        {/* Default checkbox */}
        <div className="sm:col-span-2 flex items-center gap-3 bg-white p-3 rounded-xl border border-surface-300">
          <input type="checkbox" id="isDefault" {...register('isDefault')} className="w-5 h-5 text-primary-600 accent-primary-600 rounded cursor-pointer" />
          <label htmlFor="isDefault" className="text-sm font-bold text-gray-800 cursor-pointer">Set as default address</label>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-surface-300 mt-6">
        <button type="submit" disabled={isSubmitting}
          className="btn-primary flex items-center justify-center gap-2 px-6 py-2.5 text-sm w-full sm:w-auto shadow-md shadow-primary-500/20">
          <Check className="h-4 w-4" strokeWidth={3} /> {isSubmitting ? 'Saving...' : 'Save Address'}
        </button>
        <button type="button" onClick={onCancel}
          className="btn-secondary flex items-center justify-center gap-2 px-6 py-2.5 text-sm w-full sm:w-auto hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
          <X className="h-4 w-4" strokeWidth={3} /> Cancel
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
    <div className="section-cream min-h-screen py-12">
      <Helmet><title>My Profile | Ecom.</title></Helmet>

      <div className="container-custom max-w-5xl">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-8">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Profile Card Sidebar */}
          <div className="md:col-span-1">
            <div className="card p-8 text-center border-t-[6px] border-t-primary-500 rounded-[2rem] shadow-xl shadow-surface-200/50">
              <div className="relative inline-block mb-6">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-28 h-28 rounded-[2rem] object-cover border-[6px] border-white shadow-lg mx-auto bg-surface-50" />
                ) : (
                  <div className="w-28 h-28 rounded-[2rem] bg-primary-50 flex items-center justify-center text-primary-600 font-black text-4xl mx-auto border-[6px] border-white shadow-lg">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                {user?.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white p-2 rounded-xl border-[3px] border-white shadow-sm" title="Verified Account">
                    <Award className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                )}
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 leading-tight">{user?.name}</h2>
              <p className="text-xs font-bold text-primary-600 mt-2 uppercase tracking-widest bg-primary-50 inline-block px-3 py-1 rounded-lg">{user?.role} Account</p>
              
              <div className="mt-8 border-t border-surface-300 pt-6 space-y-3 text-sm">
                <div className="flex items-center text-gray-800 bg-surface-50 p-3 border border-surface-300 rounded-xl font-medium shadow-sm">
                  <Mail className="mr-3 text-primary-500 flex-shrink-0 h-5 w-5" strokeWidth={2} />
                  <span className="truncate">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center text-gray-800 bg-surface-50 p-3 border border-surface-300 rounded-xl font-medium shadow-sm">
                    <Phone className="mr-3 text-primary-500 flex-shrink-0 h-5 w-5" strokeWidth={2} />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Account Settings */}
            <div className="card p-6 sm:p-8 rounded-[2rem] shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-gray-900 flex items-center">
                  <User className="mr-2 h-6 w-6 text-primary-500" strokeWidth={2.5} />
                  Account Settings
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 ml-1">Full Name</label>
                  <p className="text-base font-bold text-gray-900 bg-surface-50 p-3.5 rounded-xl border border-surface-300 shadow-inner">{user?.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 ml-1">Email Address</label>
                  <p className="text-base font-bold text-gray-900 bg-surface-50 p-3.5 rounded-xl border border-surface-300 shadow-inner">{user?.email}</p>
                </div>
              </div>

              {!user?.isVerified && (
                <div className="mt-8 p-5 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div>
                    <p className="text-base font-black text-amber-900">Email Verification Required</p>
                    <p className="text-sm font-medium text-amber-700 mt-1">Please verify your email to access all features.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/verify-otp', { state: { email: user?.email } })}
                    className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-colors whitespace-nowrap"
                  >
                    Verify Now
                  </button>
                </div>
              )}
            </div>

            {/* Saved Addresses */}
            <div className="card p-6 sm:p-8 rounded-[2rem] shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-gray-900 flex items-center">
                  <MapPin className="mr-2 h-6 w-6 text-primary-500" strokeWidth={2.5} />
                  Saved Addresses
                </h3>
                {!showForm && (
                  <button onClick={handleAddNew}
                    className="flex items-center gap-1.5 text-sm font-bold text-primary-700 hover:text-white bg-primary-100 hover:bg-primary-600 px-4 py-2 rounded-xl transition-colors shadow-sm">
                    <Plus strokeWidth={3} className="h-4 w-4" /> Add New
                  </button>
                )}
              </div>

              {user?.addresses?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {user.addresses.map((addr) => (
                    <div key={addr._id} className={`border-2 rounded-[1.5rem] p-5 bg-white relative group transition-all ${addr.isDefault ? 'border-primary-500 shadow-md shadow-primary-500/10' : 'border-surface-300 hover:border-primary-300'}`}>
                      {addr.isDefault && (
                        <span className="absolute top-4 right-4 bg-primary-100 text-primary-700 text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg">Default</span>
                      )}
                      <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-3 bg-surface-100 inline-block px-2.5 py-1 rounded-lg">{addr.label}</p>
                      <address className="not-italic text-sm text-gray-800 font-medium leading-relaxed">
                        <span className="font-extrabold text-gray-900 block mb-1.5 text-base">{user.name}</span>
                        {addr.address}<br />
                        {addr.city}, {addr.state} - {addr.postalCode}<br />
                        <span className="font-bold text-gray-600 block mt-1">{addr.country}</span>
                        <div className="flex items-center mt-3 text-gray-800 font-bold bg-surface-50 py-1.5 px-3 rounded-lg border border-surface-300 w-fit">
                          <Phone className="h-3 w-3 mr-2 text-primary-500" /> {addr.phone}
                        </div>
                      </address>
                      <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditAddress(addr)}
                          className="flex items-center gap-1.5 text-xs text-primary-700 hover:text-white bg-primary-50 hover:bg-primary-600 px-4 py-2 rounded-lg font-bold border border-primary-100 transition-colors">
                          <Edit2 className="h-3 w-3" strokeWidth={3} /> Edit
                        </button>
                        <button onClick={() => handleDeleteAddress(addr._id)}
                          className="flex items-center gap-1.5 text-xs text-red-600 hover:text-white bg-red-50 hover:bg-red-600 px-4 py-2 rounded-lg font-bold border border-red-100 transition-colors">
                          <Trash2 className="h-3 w-3" strokeWidth={3} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !showForm && (
                  <div className="text-center py-12 bg-surface-50 rounded-[2rem] border-2 border-surface-300 border-dashed">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-surface-300 shadow-sm">
                      <MapPin className="h-8 w-8 text-surface-300" strokeWidth={2} />
                    </div>
                    <p className="text-base font-bold text-gray-900">No saved addresses</p>
                    <p className="text-sm text-gray-700 font-medium mb-4 mt-1">Add an address for faster checkout.</p>
                    <button onClick={handleAddNew}
                      className="btn-primary text-sm px-6 py-2">
                       Add Address
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
