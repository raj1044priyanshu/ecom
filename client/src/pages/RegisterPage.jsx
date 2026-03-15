import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Helmet } from 'react-helmet-async';
import Spinner from '../components/common/Spinner.jsx';
import axiosInstance from '../api/axiosInstance.js';
import toast from 'react-hot-toast';

// Google Logo SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const RegisterPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorText('');
    
    try {
      await axiosInstance.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password
      });
      
      toast.success('Registration successful. Please verify your email.');
      navigate('/verify-otp', { state: { email: data.email } });
      
    } catch (err) {
      setErrorText(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 section-cream">
      <Helmet>
        <title>Create Account | Ecom.</title>
      </Helmet>
      
      <div className="max-w-md w-full space-y-8 card p-8 sm:p-10 shadow-2xl border-2 border-surface-300 rounded-[2rem] bg-white relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-100 rounded-full blur-3xl opacity-50 z-0"></div>

        <div className="relative z-10">
          <h2 className="mt-2 text-center text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Create an account
          </h2>
          <p className="mt-3 text-center text-sm font-bold text-gray-700">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-wide">
              Log in
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-5 relative z-10" onSubmit={handleSubmit(onSubmit)}>
          {errorText && (
            <div className="bg-red-50 border-2 border-red-200 p-4 mb-4 rounded-xl shadow-sm">
              <p className="text-sm font-bold text-red-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                {errorText}
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-[10px] uppercase font-black tracking-widest text-gray-700 mb-2 ml-1">Full Name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                className={`input-field w-full shadow-sm text-base ${errors.name ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                {...register('name')}
              />
              {errors.name && <p className="mt-2 ml-1 text-xs font-bold text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-[10px] uppercase font-black tracking-widest text-gray-700 mb-2 ml-1">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`input-field w-full shadow-sm text-base ${errors.email ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                {...register('email')}
              />
              {errors.email && <p className="mt-2 ml-1 text-xs font-bold text-red-500">{errors.email.message}</p>}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-[10px] uppercase font-black tracking-widest text-gray-700 mb-2 ml-1">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={`input-field w-full shadow-sm text-base ${errors.password ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                {...register('password')}
              />
              {errors.password && <p className="mt-2 ml-1 text-xs font-bold text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-[10px] uppercase font-black tracking-widest text-gray-700 mb-2 ml-1">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={`input-field w-full shadow-sm text-base ${errors.confirmPassword ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="mt-2 ml-1 text-xs font-bold text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="pt-4 border-t-2 border-surface-300 mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-4 flex justify-center text-base font-bold shadow-xl shadow-primary-500/30"
            >
              {submitting ? <Spinner className="h-6 w-6 text-white" /> : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-8 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-surface-300" />
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="px-4 bg-white text-gray-600">Or sign up with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white border-2 border-surface-300 text-gray-800 py-3.5 flex justify-center items-center text-sm font-bold rounded-xl hover:bg-surface-50 hover:border-surface-300 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <GoogleIcon />
              Sign up with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
