import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Appointment from '../models/Appointment-model';
import User from '../models/User-model';
import { AppError } from '../utils/app-error';
import { send_response } from '../utils/response-handler';

// Helper para verificar firma de Cal.com
const verify_signature = (req: Request): boolean => {
    const signature = req.headers['x-cal-signature-256'] as string;
    const secret = process.env.CALCOM_WEBHOOK_SECRET;

    if (!signature || !secret) return false;

    const payload = JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');

    return signature === digest;
};

// @desc    Webhook endpoint para Cal.com
// @route   POST /api/appointments/webhook
export const handle_cal_webhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Verificar Seguridad
        if (!verify_signature(req)) {
            console.warn('⚠️ Webhook signature verification failed');
            return next(new AppError('Invalid signature', 401));
        }

        const { triggerEvent, payload } = req.body;
        console.log(`📅 Cal.com Webhook: ${triggerEvent}`);

        // 2. Manejar Eventos
        if (triggerEvent === 'BOOKING_CREATED') {
            // Buscar usuario por email (asistente)
            const attendee_email = payload.attendees[0]?.email;
            const user = await User.findOne({ email: attendee_email });

            if (user) {
                // Crear Cita
                await Appointment.create({
                    user_id: user._id,
                    cal_booking_id: payload.uid || payload.id, // Cal a veces varía el ID
                    type: payload.type === 'valoracion-psicologica' ? 'psych_evaluation' : 'orientation', // Ajustar según slug de Cal
                    start_time: payload.startTime,
                    end_time: payload.endTime,
                    meeting_url: payload.metadata?.videoCallUrl || payload.meetingUrl,
                    status: 'scheduled'
                });

                // Actualizar Usuario si es evaluación
                // (Asumimos que el slug del evento en Cal.com contiene 'psicologica')
                if (payload.eventTypeId || JSON.stringify(payload).includes('psicologica')) {
                    user.psych_evaluation.status = 'scheduled';
                    await user.save();
                    console.log(`✅ Usuario ${user.email} marcado como 'scheduled'`);
                }
            }
        }

        else if (triggerEvent === 'BOOKING_CANCELLED') {
            const booking_id = payload.uid || payload.id;
            await Appointment.findOneAndUpdate(
                { cal_booking_id: booking_id },
                { status: 'cancelled' }
            );

            // Opcional: Revertir estado del usuario si era evaluación
            // user.psych_evaluation.status = 'pending_schedule';
        }

        // Responder rápido a Cal.com
        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook Error:', error);
        // No enviamos error 500 para evitar reintentos infinitos si es error de lógica nuestra
        res.status(200).json({ error: 'Internal processing error' });
    }
};

// @desc    Obtener mis citas
// @route   GET /api/appointments
export const get_my_appointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user_id;
        const appointments = await Appointment.find({ user_id }).sort('-start_time');

        send_response(res, 200, 'Citas obtenidas', appointments);
    } catch (error) {
        next(error);
    }
};