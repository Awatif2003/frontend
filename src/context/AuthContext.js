import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Set to true initially to indicate loading auth state

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to load authentication data from storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const login = async (userData, token) => {
    try {
      console.log('🔐 AuthContext login called with:', { userData, hasToken: !!token });
      
      if (token) {
        await AsyncStorage.setItem('authToken', token);
        console.log('✅ Token stored in AuthContext');
      } else {
        // Check if token was already stored by ApiService
        const existingToken = await AsyncStorage.getItem('authToken');
        if (existingToken) {
          console.log('✅ Found existing token from ApiService');
        } else {
          // Backend is not providing JWT tokens, but authentication is working via session/cookies
          console.log('ℹ️ No JWT token provided - backend using session-based authentication');
        }
      }
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      console.log('✅ User authenticated successfully');
    } catch (error) {
      console.error('❌ Failed to save authentication data to storage:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to remove authentication data from storage:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
