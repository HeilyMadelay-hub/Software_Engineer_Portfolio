import api from './api';
import type { Book,CreateBookDTO, UpdateBookDTO  } from '../types';

export const bookService = {
  /**
   * Obtener todos los libros
   * GET /api/books
   */
  getAll: async (): Promise<Book[]> => {
    const response = await api.get('/api/books');
    return response.data;
  },

  /**
   * Obtener libro por ID
   * GET /api/books/:id
   */
  getById: async (id: number): Promise<Book> => {
    const response = await api.get(`/api/books/${id}`);
    return response.data;
  },

  /**
   * Crear libro
   * POST /api/books
   */
  create: async (book: CreateBookDTO): Promise<Book> => {
    const response = await api.post('/api/books', book);
    return response.data;
  },

 /**
   * Actualizar libro
   * PUT /api/books/:id
   */
  update:  async (id: number, book: UpdateBookDTO): Promise<Book> => {
    const response = await api.put(`/api/books/${id}`, book);
    return response.data;
  },

  /**
   * Eliminar libro
   * DELETE /api/books/:id
   * No se puede eliminar si tiene préstamos activos
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/books/${id}`);
  },
};