import { Request, Response, NextFunction } from "express";//Importamos los tipos de Express para tipar correctamente los controladores
import * as loanService from "../service/loanService";//Importamos el servicio de préstamos que contiene la lógica de negocio

export const createLoan = async (req: Request, res: Response, next: NextFunction) => {//Controlador que crea un préstamo nuevo
    try {
        const data = (req as any).validated ?? req.body;//Obtenemos los datos validados o el body si no hay validación
        const loan = await loanService.createLoan(data);//Creamos el préstamo usando el servicio
        res.status(201).json(loan);//Respondemos con el préstamo creado y código 201
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};

export const getLoans = async (_req: Request, res: Response, next: NextFunction) => {//Controlador que devuelve todos los préstamos
    try {
        const loans = await loanService.getLoans();//Obtenemos todos los préstamos desde el servicio
        res.json(loans);//Respondemos con la lista de préstamos
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};

export const getLoan = async (req: Request, res: Response, next: NextFunction) => {//Controlador que devuelve un préstamo por id
    try {
        const id = Number(req.params.id);//Convertimos el parámetro id a número
        const loan = await loanService.getLoanById(id);//Buscamos el préstamo por id
        if (!loan) return res.status(404).json({ error: "Préstamo no encontrado" });//Si no existe, devolvemos 404
        res.json(loan);//Si existe, lo devolvemos
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};

export const updateLoan = async (req: Request, res: Response, next: NextFunction) => {//Controlador que actualiza un préstamo
    try {
        const id = Number(req.params.id);//Obtenemos el id del préstamo a actualizar
        const data = (req as any).validated ?? req.body;//Obtenemos los datos validados o el body
        const loan = await loanService.updateLoan(id, data);//Actualizamos el préstamo mediante el servicio
        res.json(loan);//Devolvemos el préstamo actualizado
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};

export const deleteLoan = async (req: Request, res: Response, next: NextFunction) => {//Controlador que elimina un préstamo
    try {
        const id = Number(req.params.id);//Obtenemos el id del préstamo a eliminar
        await loanService.deleteLoan(id);//Eliminamos el préstamo mediante el servicio
        res.status(204).send();//Respondemos con 204 (sin contenido)
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};

export const returnLoan = async (req: Request, res: Response, next: NextFunction) => {//Controlador que marca un préstamo como devuelto
    try {
        const id = Number(req.params.id);//Obtenemos el id del préstamo
        const loan = await loanService.returnLoan(id);//Marcamos el préstamo como devuelto mediante el servicio
        res.json(loan);//Devolvemos el préstamo actualizado
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};

export const getActiveLoans = async (_req: Request, res: Response, next: NextFunction) => {//Controlador que devuelve los préstamos activos
    try {
        const loans = await loanService.getActiveLoans();//Obtenemos los préstamos activos desde el servicio
        res.json(loans);//Respondemos con la lista de préstamos activos
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};

export const getLoanHistory = async (_req: Request, res: Response, next: NextFunction) => {//Controlador que devuelve el historial completo de préstamos
    try {
        const loans = await loanService.getLoanHistory();//Obtenemos todos los préstamos desde el servicio
        res.json(loans);//Respondemos con el historial completo
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};
