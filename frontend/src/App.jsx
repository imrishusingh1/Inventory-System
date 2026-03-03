import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Admin pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import Reports from './pages/Reports';
import LowStock from './pages/LowStock';
import AdminOrders from './pages/AdminOrders';
import LandingPage from './pages/LandingPage';

// Admin route guards
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Customer portal
import CustomerRoute from './components/CustomerRoute';
import CustomerPortalLayout from './components/layout/CustomerPortalLayout';
import PortalLogin from './pages/portal/PortalLogin';
import PortalRegister from './pages/portal/PortalRegister';
import PortalHome from './pages/portal/PortalHome';
import PortalStorefront from './pages/portal/PortalStorefront';
import PortalCart from './pages/portal/PortalCart';
import PortalOrders from './pages/portal/PortalOrders';

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* ---- Public Admin/Staff Auth ---- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---- Admin / Staff Protected Routes ---- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/stock-in" element={<StockIn />} />
            <Route path="/stock-out" element={<StockOut />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/low-stock" element={<LowStock />} />
            <Route path="/orders" element={<AdminOrders />} />
          </Route>
        </Route>

        {/* ---- Customer Portal Public ---- */}
        <Route path="/portal/login" element={<PortalLogin />} />
        <Route path="/portal/register" element={<PortalRegister />} />

        {/* ---- Customer Portal Protected ---- */}
        <Route element={<CustomerRoute />}>
          <Route element={<CustomerPortalLayout />}>
            <Route path="/portal" element={<PortalHome />} />
            <Route path="/portal/store/:username" element={<PortalStorefront />} />
            <Route path="/portal/cart" element={<PortalCart />} />
            <Route path="/portal/orders" element={<PortalOrders />} />
          </Route>
        </Route>

        {/* ---- Fallback ---- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
