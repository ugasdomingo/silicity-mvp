import { Request, Response, NextFunction } from 'express';
import Scholarship from '../models/Scholarship-model';
import Application from '../models/Application-model';
import { AppError } from '../utils/app-error';
import { send_response } from '../utils/response-handler';

// @desc    Obtener todas las becas abiertas
// @route   GET /api/scholarships
export const get_all_scholarships = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const scholarships = await Scholarship.find({ status: 'open' }).sort('-created_at');
        send_response(res, 200, 'Becas obtenidas', scholarships);
    } catch (error) {
        next(error);
    }
};

// @desc    Crear beca (Admin)
// @route   POST /api/scholarships
export const create_scholarship = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Aquí podrías validar que req.user.role === 'Admin'
        const scholarship = await Scholarship.create(req.body);
        send_response(res, 201, 'Beca creada', scholarship);
    } catch (error) {
        next(error);
    }
};

// @desc    Postularse a una beca o reclamar beneficio
// @route   POST /api/scholarships/:id/apply
export const apply_to_scholarship = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const scholarship_id = req.params.id;
        const user = (req as any).user;
        const { motivation } = req.body;

        // 1. Validar beca
        const scholarship = await Scholarship.findById(scholarship_id);
        if (!scholarship || scholarship.status === 'closed') {
            return next(new AppError('Beca no disponible', 404));
        }

        // 2. Validar duplicidad
        const existing = await Application.findOne({ user_id: user.user_id, scholarship_id });
        if (existing) {
            return next(new AppError('Ya tienes una solicitud activa para este beneficio', 400));
        }

        // 3. Determinar estado inicial (NUEVA LÓGICA)
        // Si es auto_approve -> 'approved'
        // Si es normal -> 'pending'
        const initial_status = scholarship.auto_approve ? 'approved' : 'pending';

        // 4. Crear aplicación
        await Application.create({
            user_id: user.user_id,
            scholarship_id,
            status: initial_status,
            motivation: scholarship.auto_approve ? 'Solicitud automática' : motivation
        });

        // 5. Mensaje personalizado según el tipo
        const message = scholarship.auto_approve
            ? '¡Felicidades! Beneficio activado correctamente. Revisa tu email para los siguientes pasos.'
            : 'Postulación enviada exitosamente. Te avisaremos cuando sea revisada.';

        send_response(res, 201, message, { status: initial_status });
    } catch (error) {
        next(error);
    }
};

// @desc    Ver mis postulaciones
// @route   GET /api/scholarships/my-applications
export const get_my_applications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user.user_id;
        const applications = await Application.find({ user_id }).populate('scholarship_id');
        send_response(res, 200, 'Mis postulaciones', applications);
    } catch (error) {
        next(error);
    }
};

// @desc    Count Approved Applications (Admin)
// @route   GET /api/scholarships/applications-approved
export const approved_applications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const approved_applications = await Application.find({ 'status': 'approved' }).lean();
        send_response(res, 200, 'OK', { count: approved_applications?.length });
    } catch (error) {
        next(error);
    }
}