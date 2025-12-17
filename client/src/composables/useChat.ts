import { ref, onMounted, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';
import { use_auth_store } from '../stores/auth-store';
import { use_ui_store } from '../stores/ui-store';

// Singleton del socket: Una única conexión para toda la app
let socket: Socket | null = null;

export const useChat = (group_id: string) => {
    const messages = ref<any[]>([]);
    const is_typing = ref(false);
    const auth_store = use_auth_store();
    const ui_store = use_ui_store();
    let typing_timeout: any = null;

    // Inicializar conexión
    const connect = () => {
        // Si no existe conexión, la creamos
        if (!socket) {
            // Usamos la misma URL base que Axios
            const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            // Para socket.io, si la URL tiene /api, hay que limpiarla o configurar el path
            // Asumimos que el servidor corre en el root (http://localhost:5000)
            // Si VITE_API_URL es http://localhost:5000/api, ajustamos:
            const server_url = url.replace('/api', '');

            socket = io(server_url, {
                auth: {
                    token: auth_store.access_token // Enviamos JWT para handshake
                },
                transports: ['websocket'], // Forzar WS para mejor performance
                autoConnect: true
            });

            socket.on('connect', () => {
                console.log('🟢 Socket conectado:', socket?.id);
            });

            socket.on('connect_error', (err) => {
                console.error('🔴 Error conexión Socket:', err.message);
            });
        }

        // Lógica específica del Grupo
        if (socket) {
            // Unirse al canal del grupo
            socket.emit('join_group', group_id);

            // Escuchar mensajes entrantes
            socket.on('new_message', (msg) => {
                messages.value.push(msg);
            });

            // Escuchar indicador de "escribiendo..."
            socket.on('user_typing', (data) => {
                // Ignorar si soy yo mismo (aunque el backend debería filtrar)
                if (data.user_id !== auth_store.user?._id) {
                    is_typing.value = true;

                    // Quitar indicador tras 3 segundos de inactividad
                    clearTimeout(typing_timeout);
                    typing_timeout = setTimeout(() => {
                        is_typing.value = false;
                    }, 3000);
                }
            });

            //Escuchar errores
            socket.on('error', (err: any) => {
                console.error('Socket Error:', err);
                ui_store.show_toast(err.message || 'Error de conexión', 'error');
                // Opcional: Redirigir si es error crítico
            });
        }
    };

    // Acción: Enviar Mensaje
    const send_message = (text: string) => {
        if (socket && text.trim()) {
            // Emitir evento al servidor
            socket.emit('send_message', {
                group_id,
                message: text
            });
            // Nota: No hacemos push local aquí, esperamos el evento 'new_message' del servidor
            // para confirmar que se recibió y mantener sincronía real.
        }
    };

    // Acción: Notificar que estoy escribiendo
    const emit_typing = () => {
        if (socket) {
            socket.emit('typing', group_id);
        }
    };

    // Cargar historial previo (vía API REST, no Socket)
    // Esto es opcional aquí si prefieres hacerlo en la vista con el store,
    // pero es útil tenerlo encapsulado.
    /* const fetch_history = async () => {
        // Implementar llamada a API si no se usa el store de groups
    } 
    */

    onMounted(() => {
        if (auth_store.is_authenticated) {
            connect();
        }
    });

    onUnmounted(() => {
        if (socket) {
            console.log(`🔌 Saliendo del grupo ${group_id}`);
            socket.emit('leave_group', group_id);

            // Limpiar listeners específicos de este componente para no duplicar
            socket.off('new_message');
            socket.off('user_typing');

            // NO desconectamos el socket global (socket.disconnect()) para mantener 
            // la conexión activa si el usuario navega a otro grupo rápidamente.
        }
    });

    return {
        messages,
        is_typing,
        send_message,
        emit_typing
    };
};