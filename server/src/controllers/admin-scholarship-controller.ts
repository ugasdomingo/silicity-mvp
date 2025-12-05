import { Request, Response, NextFunction } from 'express';
import Application from '../models/Application-model';
import Scholarship from '../models/Scholarship-model';
import User from '../models/User-model';
import { AppError } from '../utils/app-error';
import { send_response } from '../utils/response-handler';
import { send_email } from '../utils/mailer';

// @desc    Ver todas las postulaciones pendientes
export const get_pending_applications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const applications = await Application.find({ status: 'pending' })
            .populate('user_id', 'name email profile')
            .populate('scholarship_id', 'title provider');

        send_response(res, 200, 'Postulaciones pendientes', applications);
    } catch (error) {
        next(error);
    }
};

// @desc    Evaluar postulación (Aprobar/Rechazar)
export const evaluate_application = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body; // status: 'approved' | 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return next(new AppError('Estado inválido', 400));
        }

        const application = await Application.findById(id)
            .populate('user_id')
            .populate('scholarship_id');

        if (!application) return next(new AppError('Postulación no encontrada', 404));

        // Actualizar estado
        application.status = status;
        await application.save();

        const user = application.user_id as any;
        const scholarship = application.scholarship_id as any;

        // 📧 Notificar al Usuario
        if (status === 'approved') {
            await send_email(
                user.email,
                '🎉 ¡Tu beca ha sido aprobada!',
                'scholarship-approved',
                {
                    user_name: user.name,
                    scholarship_title: scholarship.title
                }
            );
        } else {
            await send_email(
                user.email,
                'Actualización sobre tu solicitud de beca',
                'scholarship-rejected',
                {
                    user_name: user.name,
                    scholarship_title: scholarship.title,
                    discount_url: 'https://platzi.com/promo/silicity' // Hardcode o dinámico
                }
            );
        }

        send_response(res, 200, `Postulación marcada como ${status}`);
    } catch (error) {
        next(error);
    }
};