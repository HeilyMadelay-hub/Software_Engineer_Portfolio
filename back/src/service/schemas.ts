import { z } from "zod";


//Validaciones para los usuarios
export const userCreateSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio"),//Debe de ser una string y no puede estar vacio
    email: z.string().email("Email no válido"),//Debe de tener formato de email valido
    activo: z.boolean().optional(), //Campo opcional
});


export const userUpdateSchema = z.object({
    nombre: z.string().min(1).optional(),//Puede venir o no, pero si viene tiene que ser una string y no puede estar vacio
    email: z.string().email().optional(),//Puede venir o no, pero si viene tienen que ser una cadena y con formato de email
    activo: z.boolean().optional(),//Campo opcional
});

//Validaciones para los libros
export const bookCreateSchema = z.object({
    titulo: z.string().min(1, "El título es obligatorio"),//El titulo es obligatorio y no puede estar vacio
    autor: z.string().min(1, "El autor es obligatorio"),//El autor es obligatorio y no puede estar vacio
    stock: z.number().int().nonnegative("El stock no puede ser negativo"),//El stock debe de ser un enter positivo y ademas obligatorio
});

export const bookUpdateSchema = z.object({
    titulo: z.string().min(1).optional(),//El titulo puede venir o no, pero si viene debe de ser de tipo string y ademas que no venga vacio
    autor: z.string().min(1).optional(),//El autor puede venir o no, pero si viene debe de ser de tipo string y ademas que no venga vacio
    stock: z.number().int().nonnegative().optional(),//El stock debe de ser un enter positivo y ademas puede venir o no
});


//Validaciones para prestamos
export const loanCreateSchema = z.object({
    usuarioId: z.number().int().positive("usuarioId inválido"),//El id del usuario debe de ser obligatorio ademas de ser un numero positivo
    libroId: z.number().int().positive("libroId inválido"),//El id del libro debe de ser obligatorio ademas de ser un numero positivo
    diasPrestamo: z.number().int().positive("diasPrestamo inválido"),//Cuantos dias de prestamo va a tener, debe de ser obligatorio y ademas un numero entero
});

export const loanUpdateSchema = z.object({
    fechaDevolucionPrevista: z.coerce.date().optional(),//debera de ser una fecha y ademas opcional
    fechaDevolucionReal: z.coerce.date().optional(),//debera de ser una fecha y ademas opcional
});
