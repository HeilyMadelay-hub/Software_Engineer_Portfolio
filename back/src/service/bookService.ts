import { Book, Loan } from "../models/index";
// Obtenemos los modelos de libros y préstamos para trabajar con la base de datos



// Método en el que creamos un libro
export const createBook = async (data: {
    titulo: string;
    autor: string;
    stock: number;
}) => {
    // Creamos un nuevo registro de libro con los datos recibidos
    return Book.create(data);
};



// Método en el que obtenemos todos los libros
export const getBooks = async () => {
    // Devuelve todos los libros registrados en la base de datos
    return Book.findAll();
};



// Método en el que obtenemos un libro por su id
export const getBookById = async (id: number) => {
    // Busca un libro por su clave primaria (id)
    return Book.findByPk(id);
};



// Método en el que actualizamos un libro concreto
export const updateBook = async (
    id: number,
    data: Partial<{ titulo: string; autor: string; stock: number }>
) => {
    // Buscamos el libro por su id
    const book = await Book.findByPk(id);

    // Si no existe, lanzamos un error
    if (!book) throw new Error("Libro no encontrado");

    // Actualizamos los campos permitidos con los datos recibidos
    await book.update(data);

    // Devolvemos el libro actualizado
    return book;
};



// Método en el que borramos un libro concreto
export const deleteBook = async (id: number) => {
    // Buscamos el libro por su id
    const book = await Book.findByPk(id);

    // Si no existe, lanzamos un error
    if (!book) throw new Error("Libro no encontrado");

    // No podemos borrar un libro que tenga préstamos activos
    const activeLoans = await Loan.count({
        where: { libroId: id, fechaDevolucionReal: null },
        // Contamos cuántos préstamos activos existen para este libro
    });

    // Si hay préstamos activos, no permitimos eliminarlo
    if (activeLoans > 0) {
        throw new Error("No se puede eliminar un libro con préstamos activos");
    }

    // Si no tiene préstamos activos, eliminamos el libro
    await book.destroy();
};
