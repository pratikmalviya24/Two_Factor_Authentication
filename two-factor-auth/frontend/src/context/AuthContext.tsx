import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: any | null;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  user: null,
  login: () => {},
  logout: () => {},
  checkAuth: async () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.getUserProfile();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    checkAuth();  // Immediately fetch user profile after login
  }, [checkAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
    checkAuth,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
