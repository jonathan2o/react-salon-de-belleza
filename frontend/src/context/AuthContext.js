import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar tokens y usuario desde localStorage al iniciar
  useEffect(() => {
    const storedTokens = localStorage.getItem('tokens');
    const storedUser = localStorage.getItem('user');

    if (storedTokens && storedUser) {
      try {
        const parsedTokens = JSON.parse(storedTokens);
        const parsedUser = JSON.parse(storedUser);
        setTokens(parsedTokens);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error al cargar datos del localStorage:', error);
        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenData) => {
    setUser(userData);
    setTokens(tokenData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('tokens', JSON.stringify(tokenData));
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    setIsAuthenticated(false);
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
  };

  const getAuthHeader = () => {
    if (tokens && tokens.access) {
      return {
        Authorization: `Bearer ${tokens.access}`,
      };
    }
    return {};
  };

  const value = {
    user,
    tokens,
    isAuthenticated,
    loading,
    login,
    logout,
    getAuthHeader,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
