import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/app-error';
import User from '../models/User-model';

export interface AuthRequest extends Request {
    user_id?: any;
    user_data?: any;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('No estás logueado', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).user_id = (decoded as any).user_id;
        next();
    } catch (error) {
        return next(new AppError('Token inválido', 401));
    }
};

export const restrict_to = (...roles: string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            // Validar que protect se ejecutó antes
            if (!req.user_id) {
                return next(new AppError('Error de autenticación: Usuario no identificado.', 401));
            }

            // 1. Buscar usuario en BD usando el ID del token
            const user = await User.findById(req.user_id);

            // 2. Validar que exista
            if (!user) {
                return next(new AppError('Token expirado, vuelve a iniciar sesión.', 401));
            }

            // 3. Validar Rol
            if (!roles.includes(user.role)) {
                return next(new AppError('No tienes permiso para realizar esta acción', 403));
            }

            (req as any).user_data = user;

            next();
        } catch (error) {
            next(error);
        }
    };
};