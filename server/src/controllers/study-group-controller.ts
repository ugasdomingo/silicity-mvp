import { Request, Response, NextFunction } from 'express';
import StudyGroup from '../models/Study-group-model';
import GroupMessage from '../models/Group-message-model';
import User from '../models/User-model';
import { send_email } from '../utils/mailer';
import { AppError } from '../utils/app-error';
import { send_response } from '../utils/response-handler';

// @desc    Crear grupo de estudio (Estudiante)
export const create_group = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user_id;
        const { name, topic, description } = req.body;

        const user = await User.findById(user_id);
        if (!user) return next(new AppError('Usuario no encontrado', 404));

        const group = await StudyGroup.create({
            name,
            topic,
            description,
            members: [user_id], // El creador es el primer miembro
            admin_id: user_id,
            status: 'open',
            visibility: 'public',
            is_project_team: false
        });

        // 🔔 NOTIFICACIÓN ADMIN: Nuevo Grupo
        const admin_email = process.env.SMTP_USER as string;
        await send_email(
            admin_email,
            `👥 Nuevo Grupo de Estudio: ${name}`,
            'admin-alert',
            {
                alert_title: 'Comunidad Activa: Nuevo Grupo',
                message_body: 'Un estudiante ha creado un nuevo espacio de aprendizaje.',
                details: [
                    { key: 'Nombre del Grupo', value: name },
                    { key: 'Tema', value: topic },
                    { key: 'Creador', value: user?.name || 'Desconocido' },
                    { key: 'Email Creador', value: user?.email || 'N/A' }
                ]
            }
        );

        send_response(res, 201, 'Grupo creado exitosamente', group);
    } catch (error) {
        next(error);
    }
};

// @desc    Ver grupos públicos (Buscador)
export const get_open_groups = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Filtros básicos (podríamos agregar búsqueda por texto luego)
        const groups = await StudyGroup.find({
            visibility: 'public',
            status: 'open'
        })
            .populate('members', 'name profile.avatar') // Mostrar avatares de miembros
            .sort('-created_at');

        send_response(res, 200, 'OK', groups);
    } catch (error) {
        next(error);
    }
};

// @desc    Unirse a un grupo
export const join_group = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user_id;
        const group_id = req.params.id;

        const group = await StudyGroup.findById(group_id);
        if (!group) return next(new AppError('Grupo no encontrado', 404));

        if (group.status === 'closed') return next(new AppError('Este grupo está cerrado', 400));

        // Verificar si ya es miembro
        if (group.members.includes(user_id)) {
            return next(new AppError('Ya eres miembro de este grupo', 400));
        }

        // Límite hardcodeado por ahora (ej. 20)
        if (group.members.length >= 20) {
            return next(new AppError('El grupo está lleno', 400));
        }

        group.members.push(user_id);
        await group.save();

        send_response(res, 200, 'Te has unido al grupo', group);
    } catch (error) {
        next(error);
    }
};

// @desc    Salir de un grupo
export const leave_group = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user_id;
        const group_id = req.params.id;

        const group = await StudyGroup.findById(group_id);
        if (!group) return next(new AppError('Grupo no encontrado', 404));

        // Filtrar miembros para sacar al usuario
        group.members = group.members.filter(m => m.toString() !== user_id);
        await group.save();

        send_response(res, 200, 'Has salido del grupo');
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener mensajes (Historial de Chat)
export const get_group_messages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user_id;
        const group_id = req.params.id;

        // Validar acceso: Solo miembros pueden ver el chat
        const group = await StudyGroup.findById(group_id);
        if (!group) return next(new AppError('Grupo no encontrado', 404));

        const is_member = group.members.some(m => m.toString() === user_id);
        if (!is_member) return next(new AppError('No tienes acceso a este chat', 403));

        const messages = await GroupMessage.find({ group_id })
            .populate('user_id', 'name') // Para mostrar nombre en el chat
            .sort('created_at'); // Orden cronológico

        send_response(res, 200, 'OK', messages);
    } catch (error) {
        next(error);
    }
};

// @desc    Graduar equipo de proyecto a grupo público
// @route   PATCH /api/study-groups/:id/graduate
export const graduate_project_team = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user_id;
        const group_id = req.params.id;

        const group = await StudyGroup.findById(group_id);
        if (!group) return next(new AppError('Grupo no encontrado', 404));

        // Validaciones
        if (!group.is_project_team) return next(new AppError('Este no es un equipo de proyecto', 400));

        // Verificar que el usuario sea miembro del equipo
        const is_member = group.members.some(m => m.toString() === user_id);
        if (!is_member) return next(new AppError('Solo los miembros pueden realizar esta acción', 403));

        // Mutación de Estado: Abrir a la comunidad
        group.status = 'open';
        group.visibility = 'public';
        // group.is_project_team se mantiene true para mantener el badge de "Proyecto Real"

        await group.save();

        send_response(res, 200, '¡Equipo modificado! Ahora es un grupo de estudio público.', group);
    } catch (error) {
        next(error);
    }
};