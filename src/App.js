import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Vehicles from './pages/Vehicles';
import Inventory from './pages/Inventory';
import Services from './pages/Services';
import Invoices from './pages/Invoices';
import Settings from './pages/Settings';
import './App.css';

import LandingPage from './pages/LandingPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />; // Redirect to landing page instead of login if not authenticated
  
  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
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
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
