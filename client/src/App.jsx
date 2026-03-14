import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuth } from './features/auth/authSlice.js';
import { fetchCart } from './features/cart/cartSlice.js';
import AppRouter from './routes/AppRouter.jsx';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import SupportChat from './components/common/SupportChat.jsx';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check authentication status on app load
    dispatch(checkAuth()).unwrap().then(() => {
      // If authenticated, fetch cart
      dispatch(fetchCart());
    }).catch(() => {
      // Not authenticated, that's fine for public routes
    });
  }, [dispatch]);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen relative">
          <Toaster 
            position="top-center" 
            toastOptions={{
              className: 'font-medium',
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '8px',
              }
            }} 
          />
          <Navbar />
          <main className="flex-grow pt-16"> {/* Add top padding for fixed navbar */}
            <AppRouter />
          </main>
          <Footer />
          <SupportChat />
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
