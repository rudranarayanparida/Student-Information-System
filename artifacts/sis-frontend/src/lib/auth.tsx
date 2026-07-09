import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGetCurrentUser, getGetCurrentUserQueryKey, User } from '@workspace/api-client-react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sis_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sis_user');
    return saved ? JSON.parse(saved) : null;
  });

  const { data: fetchedUser, isLoading, isError } = useGetCurrentUser({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: getGetCurrentUserQueryKey(),
    }
  });

  useEffect(() => {
    if (fetchedUser) {
      setUser(fetchedUser);
      localStorage.setItem('sis_user', JSON.stringify(fetchedUser));
    }
  }, [fetchedUser]);

  useEffect(() => {
    if (isError) {
      handleLogout();
    }
  }, [isError]);

  const handleLogin = (newToken: string, newUser: User) => {
    localStorage.setItem('sis_token', newToken);
    localStorage.setItem('sis_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('sis_token');
    localStorage.removeItem('sis_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login: handleLogin, logout: handleLogout, isLoading }}>
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
