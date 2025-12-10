import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/app-error';
import User from '../models/User-model';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('No estás logueado. Por favor inicia sesión.', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        // 1. Verificar si el usuario aún existe
        const current_user = await User.findById(decoded.user_id);
        if (!current_user) {
            return next(new AppError('El usuario de este token ya no existe.', 401));
        }

        // 2. Verificar Estado de Cuenta (Bloqueo inmediato)
        if (current_user.account_status === 'suspended') {
            return next(new AppError('Tu cuenta ha sido suspendida. Contacta a soporte.', 403));
        }

        // 3. Inyectar usuario en la request (Tipado fuerte gracias a express.d.ts)
        req.user = current_user;
        next();
    } catch (error) {
        return next(new AppError('Token inválido o expirado.', 401));
    }
};

export const restrict_to = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Usuario no identificado.', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError('No tienes permiso para realizar esta acción', 403));
        }

        next();
    };
};