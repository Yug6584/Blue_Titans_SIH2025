import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = decodeJWT(token);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            token,
            role: decoded.role,
            email: decoded.email,
            id: decoded.id,
            name: decoded.name || decoded.email,
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser({
      token,
      ...userData,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user && !!user.token;
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const getAuthHeader = () => {
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    hasRole,
    getAuthHeader,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// JWT decode utility (simple implementation)
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error('Invalid token');
  }
}