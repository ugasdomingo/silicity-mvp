import { Server, Socket } from 'socket.io';
import StudyGroup from '../../models/Study-group-model';
import GroupMessage from '../../models/Group-message-model';

// ============================================
// 🛡️ CONSTANTES DE SEGURIDAD
// ============================================
const MAX_MESSAGE_LENGTH = 2000; // Límite de caracteres por mensaje
const MIN_MESSAGE_LENGTH = 1;   // Mínimo después de sanitizar

// ============================================
// 🧹 SANITIZACIÓN DE MENSAJES
// ============================================
/**
 * Escapa caracteres HTML para prevenir XSS.
 * Convierte: < > & " ' / ` = en entidades HTML seguras.
 */
const sanitize_html = (str: string): string => {
    const html_entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    return str.replace(/[&<>"'`=/]/g, char => html_entities[char]);
};

/**
 * Sanitiza y valida un mensaje de chat.
 * Retorna el mensaje limpio o null si es inválido.
 */
const sanitize_message = (message: unknown): string | null => {
    // Validar tipo
    if (typeof message !== 'string') {
        return null;
    }

    // Limpiar espacios extremos
    let cleaned = message.trim();

    // Validar longitud mínima
    if (cleaned.length < MIN_MESSAGE_LENGTH) {
        return null;
    }

    // Truncar si excede el máximo
    if (cleaned.length > MAX_MESSAGE_LENGTH) {
        cleaned = cleaned.substring(0, MAX_MESSAGE_LENGTH);
    }

    // Escapar HTML para prevenir XSS
    cleaned = sanitize_html(cleaned);

    // Normalizar saltos de línea excesivos (máximo 3 seguidos)
    cleaned = cleaned.replace(/(\r?\n){4,}/g, '\n\n\n');

    return cleaned;
};

/**
 * Valida formato de ObjectId de MongoDB
 */
const is_valid_object_id = (id: unknown): boolean => {
    if (typeof id !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
};

// ============================================
// 📡 HANDLERS DE SOCKET
// ============================================
export const register_chat_handlers = (io: Server, socket: Socket) => {

    // ========================================
    // EVENTO: Unirse a una sala (Grupo)
    // ========================================
    socket.on('join_group', async (group_id: string) => {
        try {
            // Validar formato de ID
            if (!is_valid_object_id(group_id)) {
                return socket.emit('error', { message: 'ID de grupo inválido' });
            }

            // Validación de Seguridad: Verificar existencia y membresía
            const group = await StudyGroup.findById(group_id);

            if (!group) {
                return socket.emit('error', { message: 'Grupo no encontrado' });
            }

            // Verificar si el usuario es miembro
            const user_id = socket.user?.user_id;
            if (!user_id) {
                return socket.emit('error', { message: 'Usuario no autenticado' });
            }

            const is_member = group.members.some(
                (member_id) => member_id.toString() === user_id
            );

            const is_admin = group.admin_id?.toString() === user_id;

            if (!is_member && !is_admin) {
                console.warn(`[Chat] ⚠️ Acceso no autorizado al grupo ${group_id} por usuario ${user_id}`);
                return socket.emit('error', { message: 'No tienes permiso para unirte a este chat.' });
            }

            // Unirse a la sala de socket.io
            await socket.join(group_id);

        } catch (error) {
            console.error('[Chat] Error en join_group:', error);
            socket.emit('error', { message: 'Error interno al unirse al grupo.' });
        }
    });

    // ========================================
    // EVENTO: Enviar Mensaje
    // ========================================
    socket.on('send_message', async (data: { group_id: string; message: string }) => {
        try {
            const { group_id, message } = data;
            const user_id = socket.user?.user_id;

            // ============================
            // 🔐 VALIDACIONES DE SEGURIDAD
            // ============================

            // 1. Validar usuario autenticado
            if (!user_id) {
                return socket.emit('error', { message: 'No autenticado' });
            }

            // 2. Validar formato de group_id
            if (!is_valid_object_id(group_id)) {
                return socket.emit('error', { message: 'ID de grupo inválido' });
            }

            // 3. Sanitizar mensaje (previene XSS)
            const sanitized_message = sanitize_message(message);
            if (!sanitized_message) {
                return; // Ignorar mensajes vacíos/inválidos silenciosamente
            }

            // 4. Re-validar membresía (por si fue expulsado)
            const group = await StudyGroup.findById(group_id);
            if (!group) {
                return socket.emit('error', { message: 'Grupo no encontrado' });
            }

            const is_member = group.members.some(id => id.toString() === user_id);
            const is_admin = group.admin_id?.toString() === user_id;

            if (!is_member && !is_admin) {
                return socket.emit('error', { message: 'Ya no tienes acceso a este grupo.' });
            }

            // ============================
            // 💾 PERSISTENCIA
            // ============================
            const new_message = await GroupMessage.create({
                group_id,
                user_id,
                message: sanitized_message // Mensaje ya sanitizado
            });

            // Enriquecer con datos del usuario
            await new_message.populate('user_id', 'name profile.avatar');

            // ============================
            // 📤 BROADCAST
            // ============================
            io.to(group_id).emit('new_message', new_message);

        } catch (error) {
            console.error('[Chat] Error en send_message:', error);
            socket.emit('error', { message: 'Error al enviar el mensaje.' });
        }
    });

    // ========================================
    // EVENTO: Indicador "Escribiendo..."
    // ========================================
    socket.on('typing', (group_id: string) => {
        // Validar formato básico antes de emitir
        if (!is_valid_object_id(group_id)) return;

        // Retransmitir a la sala, excluyendo al emisor
        socket.to(group_id).emit('user_typing', {
            user_id: socket.user?.user_id
        });
    });

    // ========================================
    // EVENTO: Salir de grupo (cleanup)
    // ========================================
    socket.on('leave_group', (group_id: string) => {
        if (is_valid_object_id(group_id)) {
            socket.leave(group_id);
        }
    });
};