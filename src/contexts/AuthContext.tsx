import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('creativepro_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Convert joinedAt string back to Date object
      if (parsedUser.joinedAt) {
        parsedUser.joinedAt = new Date(parsedUser.joinedAt);
      }
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('creativepro_all_users') || '[]');
      const existingUser = existingUsers.find((u: User) => u.email === email);
      
      if (existingUser) {
        // Convert joinedAt string back to Date object
        if (existingUser.joinedAt) {
          existingUser.joinedAt = new Date(existingUser.joinedAt);
        }
        setUser(existingUser);
        localStorage.setItem('creativepro_user', JSON.stringify(existingUser));
      } else {
        throw new Error('User not found. Please sign up first.');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('creativepro_all_users') || '[]');
      const userExists = existingUsers.find((u: User) => u.email === email);
      
      if (userExists) {
        throw new Error('User with this email already exists. Please log in instead.');
      }
      
      // Create new user with unique ID
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        bio: `Hello! I'm ${name}, excited to share and discover innovative ideas on CreativePro.`,
        karma: 0,
        ideas: [],
        followers: 0,
        following: 0,
        joinedAt: new Date(),
        verificationStatus: 'unverified'
      };
      
      // Save to all users list
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('creativepro_all_users', JSON.stringify(updatedUsers));
      
      // Set as current user
      setUser(newUser);
      localStorage.setItem('creativepro_user', JSON.stringify(newUser));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('creativepro_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};