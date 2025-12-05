import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod'; // ✅ Importamos ZodType, el estándar 2025
import { send_response } from '../utils/response-handler';

// ✅ Usamos ZodType para aceptar cualquier esquema (objetos, efectos, uniones)
export const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
        // .parse() es sincrónico y seguro. Si falla, lanza excepción.
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            // Mapeamos los 'issues' (el término correcto en v4) para el frontend
            const error_messages = error.issues.map((issue) => ({
                // path[1] suele ser el campo dentro de body/query/params
                // Si es un error raíz, usamos path[0]
                field: issue.path[1] ? String(issue.path[1]) : String(issue.path[0]),
                message: issue.message,
            }));

            send_response(res, 400, 'Datos inválidos', error_messages);
            return;
        }
        // Si no es error de validación, lo pasamos al error handler global
        next(error);
    }
};