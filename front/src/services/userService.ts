import api from './api';
import type { User,CreateUserDTO,UpdateUserDTO } from '../types';

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/api/users');
    return response.data;
  },

  create: async (user: CreateUserDTO): Promise<User> => {
    const response = await api.post('/api/users', user);
    return response.data;
  },

   getById: async (id: number): Promise<User> => {
    if (!id || id <= 0) {
    throw new Error('ID de usuario inválido');
  }
    const response = await api.get(`/api/users/${id}`);
    if (!response.data) {
    throw new Error('Usuario no encontrado');
  }
    return response.data;
  },

  
  update: async (id: number, data: UpdateUserDTO): Promise<User> => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

 delete: async (id: number): Promise<{ success: boolean }> => {
  await api.delete(`/api/users/${id}`);
  return { success: true };
},
};