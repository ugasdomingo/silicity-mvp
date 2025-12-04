import { Response } from 'express';

/**
 * Envía una respuesta JSON estandarizada.
 * Estructura: { status: 'success', message: string, data: any }
 */
export const send_response = (
    res: Response,
    status_code: number,
    message: string,
    data?: any
) => {
    res.status(status_code).json({
        status: 'success',
        message,
        data,
    });
};