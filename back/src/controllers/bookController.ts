import { Request, Response, NextFunction } from "express";//Importamos los tipos de Express para tipar correctamente los controladores
import * as bookService from "../service/bookService";//Importamos el servicio de libros que contiene la lógica de negocio

export const createBook = async (req: Request, res: Response, next: NextFunction) => {//Controlador que crea un libro nuevo
    try {
        const data = (req as any).validated ?? req.body;//Obtenemos los datos validados o el body si no hay validación
        const book = await bookService.createBook(data);//Creamos el libro usando el servicio
        res.status(201).json(book);//Respondemos con el libro creado y código 201
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};

export const getBooks = async (_req: Request, res: Response, next: NextFunction) => {//Controlador que devuelve todos los libros
    try {
        const books = await bookService.getBooks();//Obtenemos todos los libros desde el servicio
        res.json(books);//Respondemos con la lista de libros
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};

export const getBook = async (req: Request, res: Response, next: NextFunction) => {//Controlador que devuelve un libro por id
    try {
        const id = Number(req.params.id);//Convertimos el parámetro id a número
        const book = await bookService.getBookById(id);//Buscamos el libro por id
        if (!book) return res.status(404).json({ error: "Libro no encontrado" });//Si no existe, devolvemos 404
        res.json(book);//Si existe, lo devolvemos
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};

export const updateBook = async (req: Request, res: Response, next: NextFunction) => {//Controlador que actualiza un libro
    try {
        const id = Number(req.params.id);//Obtenemos el id del libro a actualizar
        const data = (req as any).validated ?? req.body;//Obtenemos los datos validados o el body
        const book = await bookService.updateBook(id, data);//Actualizamos el libro mediante el servicio
        res.json(book);//Devolvemos el libro actualizado
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};

export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {//Controlador que elimina un libro
    try {
        const id = Number(req.params.id);//Obtenemos el id del libro a eliminar
        await bookService.deleteBook(id);//Eliminamos el libro mediante el servicio
        res.status(204).send();//Respondemos con 204 (sin contenido)
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};
