import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { UserRole } from '../types';

export interface CurrentUser {
  id?: string;
  name?: string;
  email?: string;
  roles: string[];
  [key: string]: any;
}

interface AuthContextValue {
  token: string | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isAdmin: () => boolean;
  reload: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // add padding if required
    const pad = payload.length % 4;
    const padded = payload + (pad ? '='.repeat(4 - pad) : '');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [user, setUser] = useState<CurrentUser | null>(() => {
    const t = localStorage.getItem('access_token');
    if (!t) return null;
    const payload = decodeJwtPayload(t);
    if (!payload) return null;
    const roles = payload.roles ?? payload.role ?? payload.roleName ?? payload.roleNames ?? [];
    return {
      id: payload.sub ?? payload.id,
      name: payload.name ?? payload.username,
      email: payload.email,
      roles: Array.isArray(roles) ? roles : typeof roles === 'string' ? [roles] : [],
      ...payload,
    } as CurrentUser;
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        const t = localStorage.getItem('access_token');
        setToken(t);
        if (t) {
          const payload = decodeJwtPayload(t);
          const roles = payload?.roles ?? payload?.role ?? payload?.roleName ?? [];
          setUser({
            id: payload?.sub ?? payload?.id,
            name: payload?.name ?? payload?.username,
            email: payload?.email,
            roles: Array.isArray(roles) ? roles : typeof roles === 'string' ? [roles] : [],
            ...payload,
          });
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isAdmin = () => {
    if (!user || !user.roles) return false;
    return user.roles.includes(UserRole.ADMIN) || user.roles.includes(UserRole.SUPER_ADMIN) || user.roles.includes('Admin') || user.roles.includes('Super Admin');
  };

  const reload = () => {
    const t = localStorage.getItem('access_token');
    setToken(t);
    if (t) {
      const payload = decodeJwtPayload(t);
      const roles = payload?.roles ?? payload?.role ?? payload?.roleName ?? [];
      setUser({
        id: payload?.sub ?? payload?.id,
        name: payload?.name ?? payload?.username,
        email: payload?.email,
        roles: Array.isArray(roles) ? roles : typeof roles === 'string' ? [roles] : [],
        ...payload,
      });
    } else {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      isAdmin,
      reload,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}