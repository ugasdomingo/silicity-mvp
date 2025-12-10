import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/app-error';

export const auth_limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Máximo 10 intentos por IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new AppError('Demasiados intentos de inicio de sesión. Por favor intente en 15 minutos.', 429));
    }
});