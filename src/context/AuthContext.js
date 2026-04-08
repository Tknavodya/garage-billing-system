import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for persisted session
    const storedUser = localStorage.getItem('garage_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('garage_user', JSON.stringify(data.user));
        localStorage.setItem('garage_token', data.access);
        return { success: true };
      }
      
      const errorData = await response.json();
      // Django DRF validation errors usually come as an array or string
      // e.g. ["Invalid password"] or { "non_field_errors": ["..."] }
      let errorMessage = 'Login failed';
      
      if (typeof errorData === 'object') {
        if (Array.isArray(errorData)) {
            errorMessage = errorData[0];
        } else {
             // Handle { "non_field_errors": [...] } or { "detail": "..." }
             const keys = Object.keys(errorData);
             if (keys.length > 0) {
                 const firstError = errorData[keys[0]];
                 errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
             }
        }
      }
      
      return { success: false, error: errorMessage };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('garage_user');
    localStorage.removeItem('garage_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
