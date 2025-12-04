import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

export const error_handler = (
    err: AppError | Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let status_code = 500;
    let status = 'error';
    // Mensaje por defecto para errores 500 (Internal Server Error)
    let message = 'Ha ocurrido un error por favor intente más tarde';

    if (err instanceof AppError) {
        // Si es un error operativo controlado (ej: 404, 401, 400), usamos su mensaje real
        status_code = err.status_code;
        status = err.status;
        message = err.message;
        console.error('💥 ERROR OPERATIVO:', err);
    } else {
        // Si es un error desconocido (500) o bug de programación
        console.error('💥 ERROR EN SERVIDOR:', err); // Logueamos en servidor para debug

        // Si estamos en desarrollo, tal vez queramos ver el error real en la respuesta (opcional)
        // Pero respetando tu instrucción estricta, mantenemos el mensaje genérico en la respuesta JSON
    }

    res.status(status_code).json({
        status,
        message,
        // Stack trace solo en desarrollo para debuggear
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};