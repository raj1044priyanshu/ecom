import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import Spinner from '../components/common/Spinner.jsx';
import axiosInstance from '../api/axiosInstance.js';
import { checkAuth } from '../features/auth/authSlice.js';
import toast from 'react-hot-toast';

const OTPPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const inputRefs = useRef([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const email = location.state?.email;

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Allow pasting
    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split('');
      for (let i = 0; i < pastedData.length; i++) {
        if (index + i < 6) newOtp[index + i] = pastedData[i];
      }
      setOtp(newOtp);
      // Focus last filled input
      const nextIndex = Math.min(index + pastedData.length, 5);
      inputRefs.current[nextIndex].focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Delete and focus previous
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post('/auth/verify-otp', { email, otp: otpValue });
      toast.success('Account verified successfully!');
      
      // Update Redux state
      await dispatch(checkAuth()).unwrap();
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await axiosInstance.post('/auth/resend-otp', { email });
      toast.success('New OTP sent to your email');
      setTimeLeft(600);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  // Format time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Verify Email | Ecom.</title>
      </Helmet>
      
      <div className="max-w-md w-full space-y-8 card p-8 text-center">
        <div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
            Verify your email
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            We've sent a 6-digit code to<br/>
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 sm:gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={6}
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
              />
            ))}
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting || otp.join('').length !== 6}
              className="w-full btn-primary py-3 text-base flex justify-center"
            >
              {submitting ? <Spinner className="h-5 w-5 text-white" /> : 'Verify Account'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-sm">
          {timeLeft > 0 ? (
            <p className="text-gray-500">
              Code expires in <span className="font-semibold text-primary-600">{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
            </p>
          ) : (
            <p className="text-red-500 text-sm mb-4">Code expired</p>
          )}
          
          <p className="mt-6">
            Didn't receive the code?{' '}
            <button 
              onClick={handleResend}
              disabled={resending}
              className="font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none"
            >
              {resending ? 'Sending...' : 'Resend'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPPage;
