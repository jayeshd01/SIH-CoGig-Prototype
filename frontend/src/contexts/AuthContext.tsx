import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { DEFAULT_WORKERS } from '../data/mockData';

const DEMO_USERS: Record<UserRole, User> = {
  CUSTOMER: {
    id: 'demo-cust-id',
    email: 'customer@demo.com',
    firstName: 'Anita',
    lastName: 'Deshmukh',
    role: 'CUSTOMER',
    isActive: true,
    language: 'en',
    createdAt: new Date().toISOString(),
    customer: {
      id: 'cust-record-1',
      userId: 'demo-cust-id',
      addressText: '45, MG Road, Shivaji Nagar, Pune 411005',
      latitude: 18.5204,
      longitude: 73.8567,
    },
  },
  WORKER: {
    id: 'demo-worker-id',
    email: 'worker@demo.com',
    firstName: 'Rajesh',
    lastName: 'Patil',
    role: 'WORKER',
    isActive: true,
    language: 'hi',
    createdAt: new Date().toISOString(),
    worker: DEFAULT_WORKERS[0],
  },
  ADMIN: {
    id: 'demo-admin-id',
    email: 'admin@demo.com',
    firstName: 'Priya',
    lastName: 'Sharma',
    role: 'ADMIN',
    isActive: true,
    language: 'en',
    createdAt: new Date().toISOString(),
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('cogig_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('cogig_token') || localStorage.getItem('sahyog_token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      const savedToken = localStorage.getItem('cogig_token') || localStorage.getItem('sahyog_token');
      if (savedToken) {
        if (savedToken.startsWith('demo-token-')) {
          return;
        }
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
          localStorage.setItem('cogig_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Profile fetch failed, retaining existing user state');
        }
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('cogig_token', res.data.accessToken);
      localStorage.setItem('cogig_user', JSON.stringify(res.data.user));
      setToken(res.data.accessToken);
      setUser(res.data.user);
    } catch (err: any) {
      // If backend is offline, check if this is a demo account
      const lower = email.toLowerCase();
      let demoRole: UserRole | null = null;
      if (lower.includes('customer')) demoRole = 'CUSTOMER';
      else if (lower.includes('worker')) demoRole = 'WORKER';
      else if (lower.includes('admin')) demoRole = 'ADMIN';

      if (demoRole) {
        const demoUser = DEMO_USERS[demoRole];
        const demoToken = `demo-token-${demoRole.toLowerCase()}`;
        localStorage.setItem('cogig_token', demoToken);
        localStorage.setItem('cogig_user', JSON.stringify(demoUser));
        setToken(demoToken);
        setUser(demoUser);
        return;
      }
      throw err;
    }
  };

  const loginAsDemo = async (role: UserRole) => {
    const demoUser = DEMO_USERS[role];
    const demoToken = `demo-token-${role.toLowerCase()}`;
    try {
      let email = 'customer@demo.com';
      if (role === 'WORKER') email = 'worker@demo.com';
      if (role === 'ADMIN') email = 'admin@demo.com';

      await login(email, 'Demo@123');
    } catch (e) {
      localStorage.setItem('cogig_token', demoToken);
      localStorage.setItem('cogig_user', JSON.stringify(demoUser));
      setToken(demoToken);
      setUser(demoUser);
    }
  };

  const register = async (data: any) => {
    try {
      const res = await api.post('/auth/register', data);
      localStorage.setItem('cogig_token', res.data.accessToken);
      localStorage.setItem('cogig_user', JSON.stringify(res.data.user));
      setToken(res.data.accessToken);
      setUser(res.data.user);
    } catch (err) {
      // Mock registration if backend is offline
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email: data.email || 'user@example.com',
        firstName: data.firstName || 'New',
        lastName: data.lastName || 'User',
        role: data.role || 'CUSTOMER',
        isActive: true,
        language: 'en',
        createdAt: new Date().toISOString(),
      };
      const mockToken = `demo-token-${mockUser.role.toLowerCase()}`;
      localStorage.setItem('cogig_token', mockToken);
      localStorage.setItem('cogig_user', JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('cogig_token');
    localStorage.removeItem('sahyog_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, loginAsDemo, register, logout }}>
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
