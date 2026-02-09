
import { Router } from "express";
import {
    createLoan,
    getLoans,
    getLoan,
    updateLoan,
    deleteLoan,
    returnLoan,
    getActiveLoans,
    getLoanHistory,
} from "../controllers/loanController";
import { validate } from "../service/validate";
import { loanCreateSchema, loanUpdateSchema } from "../service/schemas";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Loans
 *   description: Operaciones CRUD y gestión de préstamos
 */

/**
 * @swagger
 * /api/loans:
 *   get:
 *     summary: Obtener todos los préstamos
 *     tags: [Loans]
 *     responses:
 *       200:
 *         description: Lista de préstamos
 *
 *   post:
 *     summary: Crear un préstamo (reduce stock del libro)
 *     tags: [Loans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuarioId:
 *                 type: integer
 *               libroId:
 *                 type: integer
 *               diasPrestamo:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Préstamo creado correctamente
 */
router.post("/", validate(loanCreateSchema), createLoan);
router.get("/", getLoans);

/**
 * @swagger
 * /api/loans/{id}:
 *   get:
 *     summary: Obtener un préstamo por ID
 *     tags: [Loans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Préstamo encontrado
 *       404:
 *         description: Préstamo no encontrado
 *
 *   put:
 *     summary: Actualizar un préstamo
 *     tags: [Loans]
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
 *               fechaDevolucionPrevista:
 *                 type: string
 *                 format: date
 *               fechaDevolucionReal:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Préstamo actualizado
 *
 *   delete:
 *     summary: Eliminar un préstamo (si está activo, aumenta stock)
 *     tags: [Loans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Préstamo eliminado
 */
router.get("/:id", getLoan);
router.put("/:id", validate(loanUpdateSchema), updateLoan);
router.delete("/:id", deleteLoan);

/**
 * @swagger
 * /api/loans/{id}/devolver:
 *   post:
 *     summary: Devolver un préstamo (aumenta stock del libro)
 *     tags: [Loans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Préstamo devuelto correctamente
 */
router.post("/:id/devolver", returnLoan);

/**
 * @swagger
 * /api/loans/estado/activos:
 *   get:
 *     summary: Obtener préstamos activos (no devueltos)
 *     tags: [Loans]
 *     responses:
 *       200:
 *         description: Lista de préstamos activos
 */
router.get("/estado/activos", getActiveLoans);

/**
 * @swagger
 * /api/loans/estado/historial:
 *   get:
 *     summary: Obtener historial completo de préstamos
 *     tags: [Loans]
 *     responses:
 *       200:
 *         description: Historial de préstamos
 */
router.get("/estado/historial", getLoanHistory);

export default router;
