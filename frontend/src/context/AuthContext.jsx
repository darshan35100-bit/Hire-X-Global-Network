import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('hirex_user') || 'null');
    } catch(e) {
      sessionStorage.removeItem('hirex_user');
      return null;
    }
  });
  const [token, setToken] = useState(sessionStorage.getItem('hirex_token') || null);

  const login = (userData, jwtToken) => {
    sessionStorage.setItem('hirex_user', JSON.stringify(userData));
    sessionStorage.setItem('hirex_token', jwtToken);
    setUser(userData);
    setToken(jwtToken);
  };

  const logout = () => {
    sessionStorage.removeItem('hirex_user');
    sessionStorage.removeItem('hirex_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
