import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app load
  const checkAuthStatus = async (retryCount = 0) => {
    try {
      console.log(`🔍 Checking authentication status... (attempt ${retryCount + 1})`);
      setLoading(true);

      const response = await axios.get('http://localhost:8000/auth/status', {
        withCredentials: true,
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Auth status response:', response.data);

      if (response.data.isAuthenticated) {
        console.log('✅ User is authenticated:', response.data.user);
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        console.log('❌ User is not authenticated');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error(`❌ Auth check failed (attempt ${retryCount + 1}):`, error);

      // Retry up to 2 times for network errors
      if (retryCount < 2 && (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED')) {
        console.log(`🔄 Retrying auth check in ${(retryCount + 1) * 1000}ms...`);
        setTimeout(() => {
          checkAuthStatus(retryCount + 1);
        }, (retryCount + 1) * 1000);
        return;
      }

      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    try {
      console.log('🚪 Initiating logout...');
      await axios.get('http://localhost:8000/auth/logout', {
        withCredentials: true
      });
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout successful, redirecting...');
      window.location.href = '/?logout=success';
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Force logout even if backend fails
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/?logout=error';
    }
  };

  const forceLogout = async () => {
    try {
      console.log('🔧 Force logout initiated...');
      await axios.post('http://localhost:8000/auth/force-logout', {}, {
        withCredentials: true
      });
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/?logout=forced';
    } catch (error) {
      console.error('❌ Force logout failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/?logout=error';
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    checkAuthStatus,
    logout,
    forceLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
