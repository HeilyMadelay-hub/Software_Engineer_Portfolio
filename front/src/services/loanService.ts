import api from './api';
import type { Loan,LoanWithDetails, CreateLoanDTO,UpdateLoanDTO } from '../types';

/**
 * Servicio para operaciones de préstamos
 * Conecta con los endpoints de /api/loans del backend
 */
export const loanService = {
  /**
   * Obtener todos los préstamos
   * GET /api/loans
   */
  getAll: async (): Promise<LoanWithDetails[]> => {
    const response = await api.get('/api/loans');
    return response.data;
  },

  /**
   * Obtener un préstamo por ID
   * GET /api/loans/:id
   */
  getLoanById : async (id: number): Promise<Loan> => {
    const response = await api.get(`/api/loans/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo préstamo
   * POST /api/loans
   * Reduce el stock del libro automáticamente
   */
  create: async (loan: CreateLoanDTO): Promise<Loan> => {
    const response = await api.post('/api/loans', loan);
    return response.data;
  },

  /**
   * Actualizar un préstamo
   * PUT /api/loans/:id
   */
 update: async (
  id: number,
  data: UpdateLoanDTO
): Promise<Loan> => {
  const response = await api.put(`/api/loans/${id}`, data);
  return response.data;
},


  /**
   * Eliminar un préstamo
   * DELETE /api/loans/:id
   * Si el préstamo está activo, aumenta el stock del libro
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/loans/${id}`);
  },

  /**
   * Devolver un libro (marcar préstamo como devuelto)
   * POST /api/loans/:id/devolver
   * Aumenta el stock del libro automáticamente
   */
  returnBook: async (id: number): Promise<Loan> => {
    const response = await api.post(`/api/loans/${id}/devolver`);
    return response.data;
  },

  /**
   * Obtener préstamos activos (no devueltos)
   * GET /api/loans/estado/activos
   */
  getActive: async (): Promise<LoanWithDetails[]> => {
    const response = await api.get('/api/loans/estado/activos');
    return response.data;
  },

  /**
   * Obtener historial completo de préstamos
   * GET /api/loans/estado/historial
   */
  getHistory: async (): Promise<LoanWithDetails[]> => {
    const response = await api.get('/api/loans/estado/historial');
    return response.data;
  },
};