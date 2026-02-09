/**
 * Modelo de Usuario
 * Basado en el modelo Sequelize User
 */
export interface User {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * DTO para crear un usuario
 * (sin ID, activo tiene default true)
 */
export interface CreateUserDTO {
  nombre: string;
  email: string;
  activo?: boolean; // Opcional porque tiene default
}

/**
 * DTO para actualizar un usuario
 */
export interface UpdateUserDTO {
  nombre?: string;
  email?: string;
  activo?: boolean;
}