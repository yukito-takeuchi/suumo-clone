'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, IndividualProfile, CorporateProfile, ApiResponse } from '@/types';
import axios from '@/lib/axios';

interface AuthContextType {
  user: User | null;
  profile: IndividualProfile | CorporateProfile | null;
  idToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: 'individual' | 'corporate') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<IndividualProfile | CorporateProfile | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 初期化: ローカルストレージから認証情報を復元
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('idToken');
      const storedUser = localStorage.getItem('user');
      const storedProfile = localStorage.getItem('profile');

      if (storedToken && storedUser) {
        setIdToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post<ApiResponse<{
        user: User;
        profile: IndividualProfile | CorporateProfile;
        customToken: string;
        idToken: string;
      }>>('/auth/login', { email, password });

      if (response.data.success && response.data.data) {
        const { user, profile, idToken } = response.data.data;

        setUser(user);
        setProfile(profile);
        setIdToken(idToken);

        if (typeof window !== 'undefined') {
          localStorage.setItem('idToken', idToken);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('profile', JSON.stringify(profile));
        }
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'ログインに失敗しました');
    }
  };

  const register = async (email: string, password: string, role: 'individual' | 'corporate') => {
    try {
      const response = await axios.post<ApiResponse<{
        user: User;
        customToken: string;
        idToken: string;
      }>>('/auth/register', { email, password, role });

      if (response.data.success && response.data.data) {
        const { user, idToken } = response.data.data;

        setUser(user);
        setIdToken(idToken);

        if (typeof window !== 'undefined') {
          localStorage.setItem('idToken', idToken);
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || '登録に失敗しました');
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setIdToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('idToken');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        idToken,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
