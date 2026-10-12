import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('delivery_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('delivery_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (token && !user) {
      authApi.getMe().then(setUser).catch(() => logout());
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await authApi.login(email, pass);
    setToken(res.token);
    setUser({ id: res.id, name: res.name, email: res.email, role: res.role });
    localStorage.setItem('delivery_token', res.token);
    localStorage.setItem('delivery_user', JSON.stringify({ id: res.id, name: res.name, email: res.email, role: res.role }));
  };

  const demoLogin = async () => {
    await login('admin@delivery.com', 'admin123');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('delivery_token');
    localStorage.removeItem('delivery_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token || !!user,
        login,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
