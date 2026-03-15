import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuth, setUserForce } from '../../features/auth/authSlice.js';
import { fetchCart } from '../../features/cart/cartSlice.js';

const OAuthSuccessHandler = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // The backend set HTTP-only cookies before redirecting here.
    // We just need to trigger a profile fetch to update Redux state.
    dispatch(checkAuth())
      .unwrap()
      .then((user) => {
        dispatch(setUserForce(user));
        dispatch(fetchCart());
        navigate('/', { replace: true });
      })
      .catch(() => {
        navigate('/login', { replace: true });
      });
  }, [dispatch, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-800 font-medium">Completing login...</p>
      </div>
    </div>
  );
};

export default OAuthSuccessHandler;
