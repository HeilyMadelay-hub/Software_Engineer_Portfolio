/**
 * Modelo de Libro
 * Basado en el modelo Sequelize Book
 */
export interface Book {
  id: number;
  titulo: string;
  autor: string;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * DTO para crear un libro
 * (sin ID, timestamps automáticos)
 */
export interface CreateBookDTO {
  titulo: string;
  autor: string;
  stock: number;
}

/**
 * DTO para actualizar un libro
 * (todos los campos opcionales)
 */
export interface UpdateBookDTO {
  titulo?: string;
  autor?: string;
  stock?: number;
}

/**
 * Libro con información de disponibilidad calculada
 */
export interface BookWithAvailability extends Book {
  disponible: boolean; // true si stock > 0
}