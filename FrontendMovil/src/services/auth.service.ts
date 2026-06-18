import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest, UpdateUserRequest } from '../models/usuario.model';

export const AuthService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest, recordarme: boolean = false): Promise<AuthResponse> => {
    // Note: the `recordarme` functionality usually implies setting expiry in web,
    // but the backend will return the same token. 
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  actualizarCuenta: async (data: UpdateUserRequest): Promise<AuthResponse> => {
    const response = await api.put('/api/auth/usuarios/cuenta', data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<any> => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<any> => {
    const response = await api.post('/api/auth/reset-password', { token, newPassword });
    return response.data;
  }
};
