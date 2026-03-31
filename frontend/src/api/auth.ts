import api from './axiosInstance';
import { AuthResponse, User } from '../types';

export const authApi = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { username, password }),

  me: () => api.get<User>('/auth/me'),
};