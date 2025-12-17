import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { socket_auth_middleware } from './socket-middleware';
import { register_chat_handlers } from './handlers/chat-handler';

let io: SocketIOServer | null = null;

export const initialize_socket_io = (httpServer: HttpServer) => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling'] // Asegurar compatibilidad
    });

    // 1. Middleware Global de Autenticación (JWT)
    io.use(socket_auth_middleware);

    // 2. Manejo de Conexiones
    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Socket Connected: ${socket.id} (User: ${socket.user?.user_id})`);

        // A. Sala Privada del Usuario (para notificaciones personales futuras)
        if (socket.user?.user_id) {
            socket.join(socket.user.user_id);
        }

        // B. Registrar Handlers de Funcionalidades
        // Aquí delegamos la lógica del chat al handler específico
        register_chat_handlers(io!, socket);

        // C. Manejo de Desconexión
        socket.on('disconnect', () => {
            // Opcional: Podríamos emitir 'user_offline' a los grupos activos si quisiéramos presence system
            console.log(`❌ Socket Disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const get_io = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};