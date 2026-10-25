import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, FreelancerProfile } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: FreelancerProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<FreelancerProfile | null>(() => {
    const saved = localStorage.getItem('profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      if (res.success && res.data.user) {
        setUser(res.data.user);
        setProfile(res.data.profile || null);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        if (res.data.profile) {
          localStorage.setItem('profile', JSON.stringify(res.data.profile));
        } else {
          localStorage.removeItem('profile');
        }
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      if (res.success && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile || null);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        if (res.data.profile) {
          localStorage.setItem('profile', JSON.stringify(res.data.profile));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      if (res.success && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile || null);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        if (res.data.profile) {
          localStorage.setItem('profile', JSON.stringify(res.data.profile));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
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
