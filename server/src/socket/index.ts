import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { socket_auth_middleware } from './socket-middleware';
import { register_chat_handlers } from './handlers/chat-handler';

let io: SocketIOServer | null = null;

// ============================================
// 🔐 VALIDACIÓN DE CONFIGURACIÓN
// ============================================
const get_cors_origin = (): string | string[] => {
    const client_url = process.env.CLIENT_URL;

    if (!client_url) {
        // En desarrollo, permitir localhost pero advertir
        if (process.env.NODE_ENV === 'development') {
            console.warn('[Socket.io] ⚠️ CLIENT_URL no definido. Usando localhost para desarrollo.');
            return ['http://localhost:5173', 'http://localhost:3000'];
        }

        // En producción, NUNCA permitir sin CLIENT_URL configurado
        throw new Error(
            '❌ FATAL: CLIENT_URL no está configurado. ' +
            'Socket.io requiere un origen específico por seguridad. ' +
            'Define CLIENT_URL en las variables de entorno.'
        );
    }

    // Soportar múltiples orígenes separados por coma (ej: "https://app.silicity.com,https://silicity.com")
    if (client_url.includes(',')) {
        return client_url.split(',').map(url => url.trim());
    }

    return client_url;
};

// ============================================
// 🚀 INICIALIZACIÓN DE SOCKET.IO
// ============================================
export const initialize_socket_io = (httpServer: HttpServer) => {
    const cors_origin = get_cors_origin();

    console.log('[Socket.io] 🔧 Configurando CORS para:', cors_origin);

    io = new SocketIOServer(httpServer, {
        cors: {
            origin: cors_origin,
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling'],
        // Timeouts de seguridad
        pingTimeout: 60000,      // 60s antes de considerar desconectado
        pingInterval: 25000,     // Ping cada 25s para mantener vivo
        connectTimeout: 45000,   // 45s para establecer conexión
    });

    // ========================================
    // 1. Middleware Global de Autenticación
    // ========================================
    io.use(socket_auth_middleware);

    // ========================================
    // 2. Manejo de Conexiones
    // ========================================
    io.on('connection', (socket: Socket) => {
        const user_id = socket.user?.user_id;

        console.log(`[Socket.io] 🔌 Conectado: ${socket.id} (User: ${user_id || 'unknown'})`);

        // A. Sala Privada del Usuario (notificaciones personales)
        if (user_id) {
            socket.join(user_id);
        }

        // B. Registrar Handlers de Chat
        register_chat_handlers(io!, socket);

        // C. Manejo de Desconexión
        socket.on('disconnect', (reason) => {
            console.log(`[Socket.io] ❌ Desconectado: ${socket.id} (Razón: ${reason})`);
        });

        // D. Manejo de Errores de Conexión
        socket.on('error', (error) => {
            console.error(`[Socket.io] 💥 Error en socket ${socket.id}:`, error.message);
        });
    });

    // ========================================
    // 3. Eventos del Servidor
    // ========================================
    io.engine.on('connection_error', (err) => {
        console.error('[Socket.io] 💥 Error de conexión:', {
            code: err.code,
            message: err.message,
            context: err.context
        });
    });

    return io;
};

// ============================================
// 📤 GETTER PARA USO EXTERNO
// ============================================
export const get_io = () => {
    if (!io) {
        throw new Error('Socket.io no ha sido inicializado. Llama a initialize_socket_io primero.');
    }
    return io;
};