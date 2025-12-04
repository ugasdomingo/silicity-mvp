import { Request, Response, NextFunction } from 'express';
import User from '../models/User-model';
import { AppError } from '../utils/app-error';
import { send_response } from '../utils/response-handler';

// @desc    Obtener mi perfil
export const get_my_profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user_id;
        const user = await User.findById(user_id);
        if (!user) return next(new AppError('Usuario no encontrado', 404));
        send_response(res, 200, 'Perfil obtenido', user);
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar perfil (Talento o Empresa)
// @route   PATCH /api/users/me
export const update_my_profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user_id;
        const { name, profile, company_info } = req.body;

        // Buscamos usuario
        const user = await User.findById(user_id);
        if (!user) return next(new AppError('Usuario no encontrado', 404));

        // 1. Actualización básica
        if (name) user.name = name;

        // 2. Actualización de Perfil de Talento (Si envían datos)
        if (profile) {
            if (profile.headline !== undefined) user.profile.headline = profile.headline;
            if (profile.bio !== undefined) user.profile.bio = profile.bio;
            if (profile.avatar !== undefined) user.profile.avatar = profile.avatar;
            if (profile.skills !== undefined) user.profile.skills = profile.skills;

            if (profile.social_links) {
                user.profile.social_links = {
                    ...user.profile.social_links,
                    ...profile.social_links
                };
            }
        }

        // 3. Actualización de Empresa/VC
        if (company_info) {
            if (company_info.description !== undefined) user.company_info.description = company_info.description;
            if (company_info.website !== undefined) user.company_info.website = company_info.website;
        }

        // Nota de seguridad: No permitimos actualizar 'role', 'payment_status' ni 'psych_evaluation' aquí.

        await user.save();
        send_response(res, 200, 'Perfil actualizado correctamente', user);
    } catch (error) {
        next(error);
    }
};

// @desc    Agendar Cita Psicológica (Cambiar estado)
// @route   POST /api/users/schedule-psych
export const schedule_psych_eval = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user_id;
        const user = await User.findById(user_id);

        if (!user) return next(new AppError('Usuario no encontrado', 404));

        // Solo si está pendiente de agendar
        if (user.psych_evaluation.status === 'pending_schedule') {
            user.psych_evaluation.status = 'scheduled';
            await user.save();
        }

        send_response(res, 200, 'Cita registrada en el sistema');
    } catch (error) {
        next(error);
    }
};