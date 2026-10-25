import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('agricloud_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('agricloud_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.warn('Session restoration failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password, portalType = 'user') => {
    const res = await api.post('/auth/login', { email, password, portalType });
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('agricloud_token', jwtToken);
    localStorage.setItem('agricloud_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const signup = async (name, email, password, role = 'user') => {
    const res = await api.post('/auth/signup', { name, email, password, role });
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('agricloud_token', jwtToken);
    localStorage.setItem('agricloud_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('agricloud_token');
    localStorage.removeItem('agricloud_user');
    setToken(null);
    setUser(null);
  };

  const isExpert = user?.role === 'expert' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      signup, 
      logout, 
      isAuthenticated: !!token,
      isExpert
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
