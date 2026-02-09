import type  { Book } from './book.types';
import type  { User } from './user.types';

/**
 * Modelo de Préstamo
 * Basado en el modelo Sequelize Loan
 */
export interface Loan {
  id: number;
  fechaPrestamo: string;           // DataTypes.DATE → string en JSON
  fechaDevolucionPrevista: string; // DataTypes.DATE → string en JSON
  fechaDevolucionReal: string | null; // Puede ser null
  usuarioId: number;               // Foreign key
  libroId: number;                 // Foreign key
  createdAt?: string;
  updatedAt?: string;
}


/**
 * Préstamo con información expandida (nombres de usuario y libro)
 * El backend devuelve 'User' (modelo "User") y 'book' (modelo "book") como claves
 */
export interface LoanWithDetails extends Loan {
  User?: User;
  book?: Book;
  usuario?: User;
  libro?: Book;
}


/**
 * DTO para crear un préstamo
 */
export interface CreateLoanDTO {
  usuarioId: number;
  libroId: number;
  diasPrestamo: number;  // ← El backend calcula fechaDevolucionPrevista
  // fechaPrestamo se genera automáticamente con DataTypes.NOW
}

/**
 * Actualizar para préstamos
 */
export interface UpdateLoanDTO {
  fechaDevolucionPrevista?: string;
  fechaDevolucionReal?: string;
}
