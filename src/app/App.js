import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import Layout from '../components/layout/Layout';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import ForgotPassword from '../features/auth/ForgotPassword';
import ResetPassword from '../features/auth/ResetPassword';
import Landing from '../features/landing/Landing';
import Dashboard from '../features/dashboard/Dashboard';
import Customers from '../features/customers/Customers';
import Vehicles from '../features/vehicles/Vehicles';
import Inventory from '../features/inventory/Inventory';
import Services from '../features/services/Services';
import Invoices from '../features/invoices/Invoices';
import Settings from '../features/settings/Settings';
import Users from '../features/users/Users';
import './App.css';

const LoadingScreen = () => (
  <div className="page-shell" style={{ minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
    <div className="loading" style={{ minWidth: '240px', textAlign: 'center' }}>Loading...</div>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <LoadingScreen />;
  if (!user) {
    return location.pathname === '/' ? <Navigate to="/landing" replace /> : <Navigate to="/login" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="services" element={<Services />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="settings" element={<Settings />} />
              <Route
                path="users"
                element={
                  <AdminRoute>
                    <Users />
                  </AdminRoute>
                }
              />
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
