import { Request, Response, NextFunction } from 'express';
import User from '../models/User-model';
import Payment from '../models/Payment-model';
import { AppError } from '../utils/app-error';
import { send_response } from '../utils/response-handler';
import { get_paypal_access_token } from '../utils/paypal-client';
import { get_login_user_data } from '../services/auth-service';

// Precios hardcodeados por seguridad (Backend manda)
const PLAN_PRICES = {
    student: 15.00,
    talent: 30.00
};

// @desc    1. Crear Orden PayPal
// @route   POST /api/payments/paypal/create-order
export const create_paypal_order = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { plan } = req.body; // 'student' o 'talent'
        const user_id = req.user!._id;

        if (!['student', 'talent'].includes(plan)) {
            return next(new AppError('Plan inválido', 400));
        }

        const price = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
        const access_token = await get_paypal_access_token();

        // Llamada a PayPal API v2
        const response = await fetch(`${process.env.PAYPAL_API_URL}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: { currency_code: 'EUR', value: price.toFixed(2) },
                    description: `Membresía Silicity ${plan.toUpperCase()}`
                }],
            }),
        });

        const order = await response.json() as any;

        if (!response.ok) {
            console.error('PayPal Create Error:', order);
            return next(new AppError('Error creando orden en PayPal', 500));
        }

        // Guardamos intención de pago en BD local
        await Payment.create({
            user_id,
            amount: price,
            method: 'paypal',
            status: 'pending',
            paypal_order_id: order.id,
            plan
        });

        send_response(res, 201, 'Orden creada', { order_id: order.id });
    } catch (error) {
        next(error);
    }
};

// @desc    2. Capturar Orden PayPal (Confirmar Pago)
// @route   POST /api/payments/paypal/capture-order
export const capture_paypal_order = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { order_id } = req.body;
        const user_id = (req as any).user.user_id;

        const payment = await Payment.findOne({ paypal_order_id: order_id, user_id });
        if (!payment) return next(new AppError('Orden no encontrada', 404));

        const access_token = await get_paypal_access_token();

        const response = await fetch(`${process.env.PAYPAL_API_URL}/v2/checkout/orders/${order_id}/capture`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json() as any;

        if (!response.ok || (data.status !== 'COMPLETED')) {
            if (data.status !== 'COMPLETED') {
                payment.status = 'failed';
                await payment.save();
                return next(new AppError('El pago no pudo ser procesado por PayPal', 400));
            }
        }

        // ÉXITO
        payment.status = 'completed';
        await payment.save();

        const user = await User.findById(user_id);
        if (!user) return next(new AppError('Usuario no encontrado', 404));

        // Actualizar Rol y Estado
        user.role = payment.plan as 'student' | 'talent';
        user.payment_status = 'active';
        await user.save();

        // ✅ AQUI ESTÁ LA CLAVE: 
        // Generamos la respuesta estándar de autenticación con los nuevos permisos
        // Esto devuelve { user_data, access_token, refresh_token }
        const response_data = await get_login_user_data(user);

        send_response(res, 200, 'Pago exitoso, membresía activada', response_data);

    } catch (error) {
        next(error);
    }
};

// @desc    3. Reportar Pago Offline (USDT/Transferencia)
// @route   POST /api/payments/offline
export const report_offline_payment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reference, plan } = req.body;
        const user_id = (req as any).user.user_id;

        if (!reference) return next(new AppError('Falta la referencia de pago', 400));

        const price = PLAN_PRICES[plan as keyof typeof PLAN_PRICES] || 0;

        // Crear pago pendiente de revisión
        await Payment.create({
            user_id,
            amount: price,
            method: 'offline',
            status: 'pending',
            offline_reference: reference,
            plan
        });

        // Actualizar usuario a "pending"
        await User.findByIdAndUpdate(user_id, {
            payment_status: 'pending'
            // NO cambiamos el role a student aún, eso lo hace el admin manualmente
        });

        send_response(res, 201, 'Pago reportado. Esperando validación del administrador.');
    } catch (error) {
        next(error);
    }
};