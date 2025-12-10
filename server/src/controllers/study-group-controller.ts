import { Request, Response, NextFunction } from 'express';
import StudyGroup from '../models/Study-group-model';
import GroupMessage from '../models/Group-message-model';
import { send_email } from '../utils/mailer';
import { AppError } from '../utils/app-error';
import { send_response } from '../utils/response-handler';

// @desc    Crear grupo de estudio
export const create_group = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!; // Viene del middleware protect

        // 🛡️ REGLA: Solo Estudiantes y Talentos pueden crear comunidad
        // Users (Free) solo consumen, Companies/VCs no participan aquí.
        if (!['student', 'talent'].includes(user.role)) {
            return next(new AppError('Solo los estudiantes y talentos pueden crear nuevos grupos de estudio.', 403));
        }

        const { name, topic, description } = req.body;

        const group = await StudyGroup.create({
            name,
            topic,
            description,
            members: [user._id], // El creador entra automáticamente
            admin_id: user._id,
            status: 'open',
            visibility: 'public',
            is_project_team: false
        });

        // Alerta Admin (Monitoreo de comunidad)
        const admin_email = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        if (admin_email) {
            await send_email(
                admin_email,
                `👥 Nuevo Grupo: ${name}`,
                'admin-alert',
                {
                    alert_title: 'Nuevo Grupo de Estudio',
                    message_body: `Creado por ${user.name} (${user.role})`,
                    details: [{ key: 'Tema', value: topic }],
                    action_url: `${process.env.CLIENT_URL}/dashboard/admin`,
                    action_text: 'Ver Grupos'
                }
            );
        }

        send_response(res, 201, 'Grupo creado exitosamente', group);
    } catch (error) {
        next(error);
    }
};

// @desc    Ver grupos públicos (Buscador)
export const get_open_groups = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Solo mostramos grupos públicos y abiertos
        const groups = await StudyGroup.find({ visibility: 'public', status: 'open' })
            .populate('members', 'name profile.avatar')
            .sort('-created_at');

        send_response(res, 200, 'OK', groups);
    } catch (error) {
        next(error);
    }
};

// @desc    Unirse a un grupo
export const join_group = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const group_id = req.params.id;

        // 🛡️ REGLA: Empresas y VCs NO pueden entrar a grupos de estudio públicos
        if (['company', 'vc'].includes(user.role)) {
            return next(new AppError('Las cuentas de empresa no pueden unirse a grupos de estudio públicos.', 403));
        }

        const group = await StudyGroup.findById(group_id);
        if (!group) return next(new AppError('Grupo no encontrado', 404));

        if (group.status === 'closed') return next(new AppError('Este grupo está cerrado', 400));

        // Evitar duplicados (convertir ObjectId a string para comparar)
        if (group.members.some(m => m.toString() === user._id.toString())) {
            return next(new AppError('Ya eres miembro de este grupo', 400));
        }

        // Límite de miembros (Hardlimit por ahora)
        if (group.members.length >= 20) {
            return next(new AppError('El grupo está lleno (Máx. 20 miembros)', 400));
        }

        group.members.push(user._id as any);
        await group.save();

        send_response(res, 200, 'Te has unido al grupo', group);
    } catch (error) {
        next(error);
    }
};

// @desc    Salir de un grupo
export const leave_group = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user!._id.toString();
        const group_id = req.params.id;

        const group = await StudyGroup.findById(group_id);
        if (!group) return next(new AppError('Grupo no encontrado', 404));

        // Filtrar el array para sacar al usuario
        group.members = group.members.filter(m => m.toString() !== user_id);
        await group.save();

        send_response(res, 200, 'Has salido del grupo');
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener mensajes (Chat)
export const get_group_messages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user!._id.toString();
        const group_id = req.params.id;

        const group = await StudyGroup.findById(group_id);
        if (!group) return next(new AppError('Grupo no encontrado', 404));

        // Validar membresía (Empresas solo entrarán aquí si fueron agregadas por Admin en un Proyecto)
        const is_member = group.members.some(m => m.toString() === user_id);
        if (!is_member) return next(new AppError('No tienes acceso a este chat. Únete primero.', 403));

        const messages = await GroupMessage.find({ group_id })
            .populate('user_id', 'name')
            .sort('created_at');

        send_response(res, 200, 'OK', messages);
    } catch (error) {
        next(error);
    }
};

// @desc    Graduar equipo de proyecto (Solo Admin del grupo)
export const graduate_project_team = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user!._id
        const group_id = req.params.id;

        const group = await StudyGroup.findById(group_id);
        if (!group) return next(new AppError('Grupo no encontrado', 404));

        if (group?.admin_id !== user_id) {
            return next(new AppError('Solo el administrador del grupo puede cambiar su estado.', 403));
        }

        if (!group.is_project_team) return next(new AppError('Este no es un equipo de proyecto', 400));

        // Al graduarse, se vuelve público
        group.status = 'open';
        group.visibility = 'public';
        await group.save();

        send_response(res, 200, '¡Equipo graduado a comunidad pública!', group);
    } catch (error) {
        next(error);
    }
};