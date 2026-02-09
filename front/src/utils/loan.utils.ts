import type { Loan } from '../types/loan.types';

export const isLoanActive = (loan: Loan): boolean => {
  return loan.fechaDevolucionReal === null;
};


//Esta funcion es un helper se metro dentro de utils para separar
//responsabilidades en types/ solo puede ir interfaces,types o DTOS.No la lógica ni funciones
//Esto se usara en la logica del front por ejemplo lo mas probable es que 
//se use en la tabla préstamos,habilitar/deshabilitar botones,eliminar prestamos o mostrar alertas
//Los utils son la lógica de presentacion en los componentes 