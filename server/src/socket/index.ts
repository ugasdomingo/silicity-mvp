import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { socket_auth_middleware } from './socket-middleware';

let io: SocketIOServer | null = null;

export const initialize_socket_io = (httpServer: HttpServer) => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || '*', // En producción esto debe ser estricto
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Aplicar Middleware de Auth
    io.use(socket_auth_middleware);

    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Socket Connected: ${socket.id} (User: ${socket.user?.user_id})`);

        // Unir al usuario a una sala privada con su ID
        // Esto permite enviar notificaciones privadas: io.to(userId).emit(...)
        if (socket.user?.user_id) {
            socket.join(socket.user.user_id);
        }

        // Manejo básico de desconexión
        socket.on('disconnect', () => {
            console.log(`❌ Socket Disconnected: ${socket.id}`);
        });

        // Aquí importaremos luego los handlers específicos (chat, notificaciones)
    });

    return io;
};

// Función helper para obtener la instancia de IO desde controladores
export const get_io = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};