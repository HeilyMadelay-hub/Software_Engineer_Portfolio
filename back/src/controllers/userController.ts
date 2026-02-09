import { Request, Response, NextFunction } from "express";//Importamos los tipos de Express para tipar correctamente los controladores
import * as userService from "../service/userService";//Importamos el servicio de usuarios que contiene la lógica de negocio

export const createUser = async (req: Request, res: Response, next: NextFunction) => {//Controlador que crea un usuario nuevo
    try {
        const data = (req as any).validated ?? req.body;//Obtenemos los datos validados o el body si no hay validación
        const user = await userService.createUser(data);//Creamos el usuario usando el servicio
        res.status(201).json(user);//Respondemos con el usuario creado y código 201
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {//Controlador que devuelve todos los usuarios
    try {
        const users = await userService.getUsers();//Obtenemos todos los usuarios desde el servicio
        res.json(users);//Respondemos con la lista de usuarios
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {//Controlador que devuelve un usuario por id
    try {
        const id = Number(req.params.id);//Convertimos el parámetro id a número
        const user = await userService.getUserById(id);//Buscamos el usuario por id
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });//Si no existe, devolvemos 404
        res.json(user);//Si existe, lo devolvemos
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {//Controlador que actualiza un usuario
    try {
        const id = Number(req.params.id);//Obtenemos el id del usuario a actualizar
        const data = (req as any).validated ?? req.body;//Obtenemos los datos validados o el body
        const user = await userService.updateUser(id, data);//Actualizamos el usuario mediante el servicio
        res.json(user);//Devolvemos el usuario actualizado
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {//Controlador que elimina un usuario
    try {
        const id = Number(req.params.id);//Obtenemos el id del usuario a eliminar
        await userService.deleteUser(id);//Eliminamos el usuario mediante el servicio
        res.status(204).send();//Respondemos con 204 (sin contenido)
    } catch (err) {
        next(err);//Pasamos el error al middleware de manejo de errores
    }
};
