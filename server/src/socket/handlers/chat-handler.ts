import { Server, Socket } from 'socket.io';
import StudyGroup from '../../models/Study-group-model';
import GroupMessage from '../../models/Group-message-model';

export const register_chat_handlers = (io: Server, socket: Socket) => {

    // EVENTO: Unirse a una sala (Grupo)
    socket.on('join_group', async (group_id: string) => {
        try {
            // 1. Validación de Seguridad: Verificar existencia y membresía
            // Buscamos el grupo y verificamos si el usuario es miembro O admin del grupo
            const group = await StudyGroup.findById(group_id);

            if (!group) {
                return socket.emit('error', { message: 'Grupo no encontrado' });
            }

            // Verificamos si el usuario solicitante está en la lista de miembros
            // Nota: socket.user.user_id viene del middleware de auth
            const is_member = group.members.some(
                (member_id) => member_id.toString() === socket.user?.user_id
            );

            // También permitimos al admin del grupo (si existe) o si es un admin global (opcional, por ahora estricto)
            const is_admin = group.admin_id?.toString() === socket.user?.user_id;

            if (!is_member && !is_admin) {
                console.warn(`⚠️ Intento de acceso no autorizado al grupo ${group_id} por usuario ${socket.user?.user_id}`);
                return socket.emit('error', { message: 'No tienes permiso para unirte a este chat.' });
            }

            // 2. Acción: Unirse a la sala de socket.io
            await socket.join(group_id);
            // console.log(`✅ Usuario ${socket.user?.user_id} unido a sala ${group_id}`);

        } catch (error) {
            console.error('Error en join_group:', error);
            socket.emit('error', { message: 'Error interno al unirse al grupo.' });
        }
    });

    // EVENTO: Enviar Mensaje
    socket.on('send_message', async (data: { group_id: string; message: string }) => {
        const { group_id, message } = data;

        // 1. Sanitización básica
        if (!message || typeof message !== 'string' || !message.trim()) {
            return; // Ignorar mensajes vacíos
        }

        try {
            // 2. Re-validación de seguridad (Doble Check)
            // Aunque esté en la sala, verificamos que siga siendo miembro en la BD (por si fue expulsado hace 1 seg)
            const group = await StudyGroup.findById(group_id);
            const user_id = socket.user?.user_id;

            if (!group || !user_id) return;

            const is_member = group.members.some(id => id.toString() === user_id);
            const is_admin = group.admin_id?.toString() === user_id;

            if (!is_member && !is_admin) {
                return socket.emit('error', { message: 'Ya no tienes acceso a este grupo.' });
            }

            // 3. Persistencia: Guardar en MongoDB
            const new_message = await GroupMessage.create({
                group_id,
                user_id,
                message: message.trim()
            });

            // 4. Enriquecimiento (Population)
            // Necesitamos enviar nombre y avatar al frontend. 
            // Según User-model: name está en raíz, avatar en profile.
            await new_message.populate('user_id', 'name profile.avatar');

            // 5. Broadcast: Emitir a TODOS en la sala (incluido el emisor para confirmación visual/check)
            io.to(group_id).emit('new_message', new_message);

        } catch (error) {
            console.error('Error en send_message:', error);
            socket.emit('error', { message: 'Error al enviar el mensaje.' });
        }
    });

    // EVENTO: Indicador "Escribiendo..."
    socket.on('typing', (group_id: string) => {
        // Simplemente retransmitimos a la sala, excluyendo al emisor
        socket.to(group_id).emit('user_typing', {
            user_id: socket.user?.user_id
        });
    });
};