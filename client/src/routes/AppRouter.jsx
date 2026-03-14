import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';

// Pages
import HomePage from '../pages/HomePage.jsx';
import ProductsPage from '../pages/ProductsPage.jsx';
import ProductDetailPage from '../pages/ProductDetailPage.jsx';
import CartPage from '../pages/CartPage.jsx';
import CheckoutPage from '../pages/CheckoutPage.jsx';
import OrdersPage from '../pages/OrdersPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import OTPPage from '../pages/OTPPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import OAuthSuccessHandler from '../components/auth/OAuthSuccessHandler.jsx';

// Admin Pages
import AdminRoute from './AdminRoute.jsx';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx';
import AdminProductsPage from '../pages/admin/AdminProductsPage.jsx';
import ProductFormPage from '../pages/admin/ProductFormPage.jsx';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage.jsx';
import AdminUsersPage from '../pages/admin/AdminUsersPage.jsx';

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      
      {/* Auth Routes (Guest only) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<OTPPage />} />
      <Route path="/auth/oauth-success" element={<OAuthSuccessHandler />} />

      {/* Protected Routes (Require Login) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/products/new" element={<ProductFormPage />} />
          <Route path="/admin/products/:id/edit" element={<ProductFormPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
