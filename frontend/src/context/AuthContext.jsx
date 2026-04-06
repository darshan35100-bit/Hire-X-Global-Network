import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('hirex_user') || 'null'));
  const [token, setToken] = useState(localStorage.getItem('hirex_token') || null);

  const login = (userData, jwtToken) => {
    localStorage.setItem('hirex_user', JSON.stringify(userData));
    localStorage.setItem('hirex_token', jwtToken);
    setUser(userData);
    setToken(jwtToken);
  };

  const logout = () => {
    localStorage.removeItem('hirex_user');
    localStorage.removeItem('hirex_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
