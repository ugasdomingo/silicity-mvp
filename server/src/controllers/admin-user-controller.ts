import { Request, Response, NextFunction } from 'express';
import User from '../models/User-model';
import Payment from '../models/Payment-model';
import Project from '../models/Project-model';
import Application from '../models/Application-model';
import { AppError } from '../utils/app-error';
import { send_response } from '../utils/response-handler';
import { send_email } from '../utils/mailer';

// ============================================
// 📊 DASHBOARD STATS
// ============================================

// @desc    Obtener estadísticas del dashboard admin
// @route   GET /api/admin/stats
export const get_dashboard_stats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [
            total_users,
            pending_companies,
            pending_payments,
            pending_projects,
            active_members,
            pending_scholarship_apps
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ account_status: 'pending_approval' }),
            Payment.countDocuments({ status: 'pending', method: 'offline' }),
            Project.countDocuments({ status: 'pending_review' }),
            User.countDocuments({ payment_status: 'active' }),
            Application.countDocuments({ status: 'pending' })
        ]);

        send_response(res, 200, 'Estadísticas obtenidas', {
            total_users,
            pending_companies,
            pending_payments,
            pending_projects,
            active_members,
            pending_scholarship_apps
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// 👥 GESTIÓN DE USUARIOS
// ============================================

// @desc    Listar usuarios con filtros
// @route   GET /api/admin/users
export const get_users_list = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            role,
            account_status,
            payment_status,
            search,
            page = 1,
            limit = 20
        } = req.query;

        // Construir query dinámico
        const query: any = {};

        if (role) query.role = role;
        if (account_status) query.account_status = account_status;
        if (payment_status) query.payment_status = payment_status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password -verification_code -refresh_token')
                .sort('-created_at')
                .skip(skip)
                .limit(Number(limit)),
            User.countDocuments(query)
        ]);

        send_response(res, 200, 'Usuarios obtenidos', {
            users,
            pagination: {
                current_page: Number(page),
                total_pages: Math.ceil(total / Number(limit)),
                total_users: total
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Aprobar cuenta de empresa
// @route   PATCH /api/admin/users/:id/approve
export const approve_company = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) return next(new AppError('Usuario no encontrado', 404));

        if (user.account_status !== 'pending_approval') {
            return next(new AppError('Esta cuenta no está pendiente de aprobación', 400));
        }

        // Aprobar cuenta y darle free trial (early adopter)
        user.account_status = 'active';
        user.payment_status = 'free_trial';
        await user.save();

        // Notificar a la empresa
        await send_email(
            user.email,
            '🎉 ¡Tu cuenta ha sido aprobada!',
            'admin-alert',
            {
                alert_title: '¡Bienvenido a Silicity!',
                message_body: `Hola ${user.name}, tu cuenta de empresa ha sido aprobada. Como early adopter, disfrutas de una membresía anual gratuita. ¡Ya puedes publicar proyectos y buscar talento!`,
                details: [
                    { key: 'Plan', value: 'Early Adopter (Gratis 1 año)' },
                    { key: 'Rol', value: user.role }
                ],
                action_url: `${process.env.CLIENT_URL}/app/dashboard`,
                action_text: 'Ir al Dashboard'
            }
        );

        send_response(res, 200, 'Empresa aprobada exitosamente', {
            user_id: user._id,
            name: user.name,
            account_status: user.account_status
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Rechazar cuenta de empresa
// @route   PATCH /api/admin/users/:id/reject
export const reject_company = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const user = await User.findById(id);
        if (!user) return next(new AppError('Usuario no encontrado', 404));

        if (user.account_status !== 'pending_approval') {
            return next(new AppError('Esta cuenta no está pendiente de aprobación', 400));
        }

        // Marcar como suspendido (rechazado)
        user.account_status = 'suspended';
        await user.save();

        // Notificar a la empresa
        await send_email(
            user.email,
            'Actualización sobre tu solicitud en Silicity',
            'admin-alert',
            {
                alert_title: 'Solicitud no aprobada',
                message_body: reason || 'Lamentablemente, tu solicitud no ha sido aprobada en este momento. Si crees que esto es un error, por favor contáctanos.',
                details: [],
                action_url: `mailto:${process.env.ADMIN_EMAIL}`,
                action_text: 'Contactar Soporte'
            }
        );

        send_response(res, 200, 'Empresa rechazada');
    } catch (error) {
        next(error);
    }
};

// @desc    Suspender usuario
// @route   PATCH /api/admin/users/:id/suspend
export const suspend_user = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const user = await User.findById(id);
        if (!user) return next(new AppError('Usuario no encontrado', 404));

        if (user.role === 'Admin') {
            return next(new AppError('No puedes suspender a un administrador', 403));
        }

        user.account_status = 'suspended';
        await user.save();

        // Notificar al usuario
        await send_email(
            user.email,
            'Tu cuenta ha sido suspendida',
            'admin-alert',
            {
                alert_title: 'Cuenta Suspendida',
                message_body: reason || 'Tu cuenta ha sido suspendida por violar nuestros términos de servicio. Si crees que esto es un error, contáctanos.',
                details: [],
                action_url: `mailto:${process.env.ADMIN_EMAIL}`,
                action_text: 'Contactar Soporte'
            }
        );

        send_response(res, 200, 'Usuario suspendido');
    } catch (error) {
        next(error);
    }
};

// @desc    Reactivar usuario suspendido
// @route   PATCH /api/admin/users/:id/reactivate
export const reactivate_user = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) return next(new AppError('Usuario no encontrado', 404));

        if (user.account_status !== 'suspended') {
            return next(new AppError('Esta cuenta no está suspendida', 400));
        }

        user.account_status = 'active';
        await user.save();

        // Notificar al usuario
        await send_email(
            user.email,
            '¡Tu cuenta ha sido reactivada!',
            'admin-alert',
            {
                alert_title: 'Cuenta Reactivada',
                message_body: '¡Buenas noticias! Tu cuenta ha sido reactivada. Ya puedes acceder a la plataforma nuevamente.',
                details: [],
                action_url: `${process.env.CLIENT_URL}/auth/login`,
                action_text: 'Iniciar Sesión'
            }
        );

        send_response(res, 200, 'Usuario reactivado');
    } catch (error) {
        next(error);
    }
};

// ============================================
// 💳 GESTIÓN DE PAGOS OFFLINE
// ============================================

// @desc    Listar pagos offline pendientes
// @route   GET /api/admin/payments/pending
export const get_pending_payments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payments = await Payment.find({
            status: 'pending',
            method: 'offline'
        })
            .populate('user_id', 'name email role')
            .sort('-created_at');

        send_response(res, 200, 'Pagos pendientes', payments);
    } catch (error) {
        next(error);
    }
};

// @desc    Aprobar pago offline
// @route   PATCH /api/admin/payments/:id/approve
export const approve_offline_payment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const payment = await Payment.findById(id).populate('user_id');
        if (!payment) return next(new AppError('Pago no encontrado', 404));

        if (payment.status !== 'pending') {
            return next(new AppError('Este pago ya fue procesado', 400));
        }

        // Actualizar pago
        payment.status = 'completed';
        await payment.save();

        // Actualizar usuario
        const user = await User.findById(payment.user_id);
        if (!user) return next(new AppError('Usuario no encontrado', 404));

        user.role = payment.plan as 'student' | 'talent';
        user.payment_status = 'active';
        await user.save();

        // Notificar al usuario
        await send_email(
            user.email,
            '🎉 ¡Pago confirmado! Tu membresía está activa',
            'admin-alert',
            {
                alert_title: '¡Membresía Activada!',
                message_body: `Hola ${user.name}, hemos verificado tu pago. Tu membresía ${payment.plan} ya está activa. ¡Disfruta de todos los beneficios!`,
                details: [
                    { key: 'Plan', value: payment.plan },
                    { key: 'Monto', value: `€${payment.amount}` },
                    { key: 'Referencia', value: payment.offline_reference || 'N/A' }
                ],
                action_url: `${process.env.CLIENT_URL}/app/dashboard`,
                action_text: 'Ir al Dashboard'
            }
        );

        send_response(res, 200, 'Pago aprobado y membresía activada', {
            payment_id: payment._id,
            user_name: user.name,
            plan: payment.plan
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Rechazar pago offline
// @route   PATCH /api/admin/payments/:id/reject
export const reject_offline_payment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const payment = await Payment.findById(id).populate('user_id');
        if (!payment) return next(new AppError('Pago no encontrado', 404));

        if (payment.status !== 'pending') {
            return next(new AppError('Este pago ya fue procesado', 400));
        }

        // Actualizar pago
        payment.status = 'failed';
        await payment.save();

        // Revertir estado del usuario a unpaid
        const user = await User.findById(payment.user_id);
        if (user) {
            user.payment_status = 'unpaid';
            await user.save();

            // Notificar al usuario
            await send_email(
                user.email,
                'Problema con tu pago reportado',
                'admin-alert',
                {
                    alert_title: 'Pago No Verificado',
                    message_body: reason || 'No pudimos verificar tu pago con la referencia proporcionada. Por favor, intenta nuevamente o contacta a soporte.',
                    details: [
                        { key: 'Referencia reportada', value: payment.offline_reference || 'N/A' }
                    ],
                    action_url: `${process.env.CLIENT_URL}/app/payment`,
                    action_text: 'Reintentar Pago'
                }
            );
        }

        send_response(res, 200, 'Pago rechazado');
    } catch (error) {
        next(error);
    }
};

// ============================================
// 🚀 GESTIÓN DE PROYECTOS (complemento)
// ============================================

// @desc    Listar proyectos pendientes de revisión
// @route   GET /api/admin/projects/pending
export const get_pending_projects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const projects = await Project.find({ status: 'pending_review' })
            .populate('company_id', 'name email profile.website')
            .sort('-created_at');

        send_response(res, 200, 'Proyectos pendientes', projects);
    } catch (error) {
        next(error);
    }
};