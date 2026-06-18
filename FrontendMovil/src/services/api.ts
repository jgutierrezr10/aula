import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use the appropriate IP for localhost depending on the platform (Android emulator uses 10.0.2.2)
// This can be adjusted based on the real backend URL in production
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the token automatically to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const storedUsuario = await AsyncStorage.getItem('usuario');
      if (storedUsuario) {
        const usuario = JSON.parse(storedUsuario);
        if (usuario.token) {
          config.headers.Authorization = `Bearer ${usuario.token}`;
        }
      }
    } catch (e) {
      console.error('Error reading token from AsyncStorage', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
