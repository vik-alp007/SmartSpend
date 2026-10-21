import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, configApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardKey, setDashboardKey] = useState(0);
  const [clientConfig, setClientConfig] = useState({
    bugChallengeMode: true,
    currency: 'INR'
  });

  useEffect(() => {
    // 1. Fetch server client settings
    configApi
      .getClientSettings()
      .then((res) => {
        if (res.success && res.data) {
          setClientConfig(res.data);
        }
      })
      .catch(() => {
        // Fallback default
      });

    // 2. Check current user authentication
    authApi
      .getMe()
      .then((res) => {
        if (res.success && res.user) {
          setUser(res.user);
        }
      })
      .catch(() => {
        localStorage.removeItem('smartspend_token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.user) {
      if (res.token) {
        localStorage.setItem('smartspend_token', res.token);
      }
      setUser(res.user);
      return res.user;
    }
  };

  const register = async (name, email, password, currency = 'INR') => {
    const res = await authApi.register({ name, email, password, currency });
    if (res.success && res.user) {
      if (res.token) {
        localStorage.setItem('smartspend_token', res.token);
      }
      setUser(res.user);
      return res.user;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore logout network error
    } finally {
      localStorage.removeItem('smartspend_token');
      setUser(null);
    }
  };

  const triggerDashboardRefresh = (isFromEdit = false) => {
    // [BUG-INT-05] If from transaction edit and competition mode is active, skip refreshing dashboard cache
    if (isFromEdit && clientConfig.bugChallengeMode) {
      // Intentional defect: does not refresh global dashboard state
      return;
    }
    setDashboardKey((prev) => prev + 1);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        clientConfig,
        login,
        register,
        logout,
        dashboardKey,
        triggerDashboardRefresh
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
