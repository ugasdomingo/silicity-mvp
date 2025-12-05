import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/app-error';

interface JwtPayload {
    user_id: string;
}

// Extender la interfaz de Socket para incluir datos del usuario
declare module 'socket.io' {
    interface Socket {
        user?: JwtPayload;
    }
}

export const socket_auth_middleware = (socket: Socket, next: (err?: any) => void) => {
    // El cliente debe enviar el token en auth: { token: "..." } o headers
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
        return next(new Error('Authentication error: Token not provided'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        // Guardamos la info del usuario en el socket para usarla luego (ej. en los mensajes)
        socket.user = decoded;
        next();
    } catch (error) {
        return next(new Error('Authentication error: Invalid token'));
    }
};