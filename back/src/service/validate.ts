import { Request, Response, NextFunction } from "express";
// Importamos los tipos de Express para tipar correctamente req, res y next

import { ZodSchema } from "zod";
// Importamos el tipo de esquema de Zod para poder recibir cualquier esquema válido


// Middleware genérico de validación
export const validate =
    (schema: ZodSchema) => // Recibe un esquema de Zod como parámetro
        (req: Request, res: Response, next: NextFunction): void => {

            const result = schema.safeParse(req.body);
            // Valida el cuerpo de la petición contra el esquema recibido

            if (!result.success) {
                const msg = result.error.issues.map((i) => i.message).join(", ");
                // Si la validación falla, recogemos todos los mensajes de error
                // y los convertimos en un solo string

                res.status(400).json({ error: msg });
                // Devolvemos respuesta 400 con los mensajes de error

                return;
                // Cortamos la ejecución del middleware
            }

            (req as any).validated = result.data;
            // Si la validación es correcta, guardamos los datos validados
            // dentro de la request para poder usarlos en el controlador

            next();
            // Continuamos con el siguiente middleware o controlador
        };
