import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from './components/layout/AdminLayout';
import RequireAuth from './components/auth/RequireAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import { RootState } from './store';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      
      {/* Protected admin routes */}
      <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
      </Route>
      
      {/* Redirect from root to dashboard if authenticated, otherwise to login */}
      <Route path="/" element={isAuthenticated ? 
        <Navigate to="/dashboard" replace /> : 
        <Navigate to="/login" replace />} 
      />
      
      {/* Fallback route - redirect to dashboard or login */}
      <Route path="*" element={isAuthenticated ? 
        <Navigate to="/dashboard" replace /> : 
        <Navigate to="/login" replace />} 
      />
    </Routes>
  );
};

export default App;
