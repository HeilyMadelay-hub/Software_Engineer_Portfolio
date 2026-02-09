import { Router } from "express";
import {
    createBook,
    getBooks,
    getBook,
    updateBook,
    deleteBook,
} from "../controllers/bookController";
import { validate } from "../service/validate";
import { bookCreateSchema, bookUpdateSchema } from "../service/schemas";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Operaciones CRUD para libros
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Obtener todos los libros
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Lista de libros
 *   post:
 *     summary: Crear un nuevo libro
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               autor:
 *                 type: string
 *               stock:
 *                 type: number
 *     responses:
 *       201:
 *         description: Libro creado correctamente
 */
router.post("/", validate(bookCreateSchema), createBook);
router.get("/", getBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Obtener un libro por ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Libro encontrado
 *       404:
 *         description: Libro no encontrado
 *
 *   put:
 *     summary: Actualizar un libro
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               autor:
 *                 type: string
 *               stock:
 *                 type: number
 *     responses:
 *       200:
 *         description: Libro actualizado
 *
 *   delete:
 *     summary: Eliminar un libro
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Libro eliminado
 *       400:
 *         description: No se puede eliminar un libro con préstamos activos
 */
router.get("/:id", getBook);
router.put("/:id", validate(bookUpdateSchema), updateBook);
router.delete("/:id", deleteBook);

export default router;
