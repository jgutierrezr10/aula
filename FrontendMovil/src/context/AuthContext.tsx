import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse } from '../models/usuario.model';

interface AuthContextType {
  usuario: AuthResponse | null;
  isLoading: boolean;
  login: (userData: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  usuario: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoginState = async () => {
      try {
        const storedUsuario = await AsyncStorage.getItem('usuario');
        if (storedUsuario) {
          setUsuario(JSON.parse(storedUsuario));
        }
      } catch (e) {
        console.error('Error reading from AsyncStorage', e);
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginState();
  }, []);

  const login = async (userData: AuthResponse) => {
    setUsuario(userData);
    await AsyncStorage.setItem('usuario', JSON.stringify(userData));
  };

  const logout = async () => {
    setUsuario(null);
    await AsyncStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
