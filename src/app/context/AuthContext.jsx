"use client";
import { createContext, useContext, useState } from 'react';

const DEMO_USERS = {
  'demo@elmhurst.edu': {
    password: 'student123',
    user: {
      name: 'Demo Student',
      email: 'demo@elmhurst.edu',
      role: 'student',
    },
  },
  'admin@elmhurst.edu': {
    password: 'admin123',
    user: {
      name: 'Admin User',
      email: 'admin@elmhurst.edu',
      role: 'admin',
    },
  },
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('mediahub_user');
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });

  const login = (email, password) => {
    const account = DEMO_USERS[email];
    if (account && account.password === password) {
      setUser(account.user);
      localStorage.setItem('mediahub_user', JSON.stringify(account.user));
      return true;
    }
    // For any other email/password, create a student account
    const newUser = {
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      role: 'student',
    };
    setUser(newUser);
    localStorage.setItem('mediahub_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mediahub_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
