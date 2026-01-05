import { Request, Response, NextFunction } from 'express';
import User from '../models/User-model';
import Payment from '../models/Payment-model';
import { AppError } from '../utils/app-error';
import { send_response } from '../utils/response-handler';
import {
    get_paypal_access_token,
    get_paypal_order_details,
    validate_captured_amount
} from '../utils/paypal-client';
import { get_login_user_data } from '../services/auth-service';

// ============================================
// 💰 PRECIOS - ÚNICA FUENTE DE VERDAD (USD)
// ============================================
// Hardcodeados por seguridad (Backend manda, cliente no decide)
// Sincronizado con client/src/static/payment-methods.ts

type PlanKey = 'student_quarterly' | 'student_yearly' | 'talent_quarterly' | 'talent_yearly';
type BasePlan = 'student' | 'talent';

interface PlanConfig {
    amount: number;
    base_plan: BasePlan;
    period: 'quarterly' | 'yearly';
    description: string;
}

const PLAN_PRICES: Record<PlanKey, PlanConfig> = {
    student_quarterly: {
        amount: 15.00,
        base_plan: 'student',
        period: 'quarterly',
        description: 'Membresía Student - 3 meses'
    },
    student_yearly: {
        amount: 50.00,
        base_plan: 'student',
        period: 'yearly',
        description: 'Membresía Student - 1 año'
    },
    talent_quarterly: {
        amount: 30.00,
        base_plan: 'talent',
        period: 'quarterly',
        description: 'Membresía Talent - 3 meses'
    },
    talent_yearly: {
        amount: 100.00,
        base_plan: 'talent',
        period: 'yearly',
        description: 'Membresía Talent - 1 año'
    }
};

// Plans válidos para validación
const VALID_PLANS = Object.keys(PLAN_PRICES) as PlanKey[];

/**
 * Valida si el plan es válido
 */
const isValidPlan = (plan: string): plan is PlanKey => {
    return VALID_PLANS.includes(plan as PlanKey);
};

// ============================================
// 1️⃣ CREAR ORDEN PAYPAL
// ============================================
// @desc    Crear orden de pago en PayPal
// @route   POST /api/payments/paypal/create-order
export const create_paypal_order = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { plan } = req.body;
        const user_id = req.user!._id;

        // Validación de plan
        if (!plan || !isValidPlan(plan)) {
            return next(new AppError(`Plan inválido. Planes válidos: ${VALID_PLANS.join(', ')}`, 400));
        }

        const plan_config = PLAN_PRICES[plan];

        // Verificar que el usuario no tenga ya una membresía activa
        const user = await User.findById(user_id);
        if (user?.payment_status === 'active') {
            return next(new AppError('Ya tienes una membresía activa', 400));
        }

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
                    amount: {
                        currency_code: 'USD',
                        value: plan_config.amount.toFixed(2)
                    },
                    description: plan_config.description,
                    // Referencia interna para auditoría
                    custom_id: `${user_id}_${plan}_${Date.now()}`
                }],
            }),
        });

        const order = await response.json() as any;

        if (!response.ok) {
            // Log seguro (sin exponer datos sensibles al cliente)
            console.error('[PayPal] Error creando orden:', {
                status: response.status,
                error: order.name,
                user_id: user_id.toString()
            });
            return next(new AppError('Error creando orden en PayPal', 500));
        }

        // Guardamos intención de pago en BD local
        await Payment.create({
            user_id,
            amount: plan_config.amount,
            currency: 'USD',
            method: 'paypal',
            status: 'pending',
            paypal_order_id: order.id,
            plan: plan,  // Guardamos el plan completo (ej: 'student_quarterly')
            period: plan_config.period,
            base_plan: plan_config.base_plan
        });

        send_response(res, 201, 'Orden creada', { order_id: order.id });
    } catch (error) {
        next(error);
    }
};

// ============================================
// 2️⃣ CAPTURAR ORDEN PAYPAL (CONFIRMAR PAGO)
// ============================================
// @desc    Capturar/confirmar pago de PayPal
// @route   POST /api/payments/paypal/capture-order
export const capture_paypal_order = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { order_id } = req.body;
        const user_id = req.user!._id;

        // ============================================
        // 🔐 VALIDACIÓN 1: Verificar que la orden pertenece al usuario
        // ============================================
        const payment = await Payment.findOne({
            paypal_order_id: order_id,
            user_id,
            status: 'pending' // Solo ordenes pendientes
        });

        if (!payment) {
            console.warn('[PayPal] Intento de captura de orden no autorizada:', {
                order_id,
                user_id: user_id.toString()
            });
            return next(new AppError('Orden no encontrada o no autorizada', 404));
        }

        // ============================================
        // 🔐 VALIDACIÓN 2: Obtener precio esperado del plan
        // ============================================
        const plan_key = payment.plan as PlanKey;
        if (!isValidPlan(plan_key)) {
            return next(new AppError('Plan de pago inválido', 400));
        }

        const expected_price = PLAN_PRICES[plan_key].amount;

        // ============================================
        // 💳 CAPTURAR EN PAYPAL
        // ============================================
        const access_token = await get_paypal_access_token();

        const capture_response = await fetch(
            `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${order_id}/capture`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const capture_data = await capture_response.json() as any;

        // Verificar respuesta de PayPal
        if (!capture_response.ok || capture_data.status !== 'COMPLETED') {
            payment.status = 'failed';
            await payment.save();

            console.error('[PayPal] Captura fallida:', {
                order_id,
                status: capture_data.status,
                error: capture_data.name
            });

            return next(new AppError('El pago no pudo ser procesado por PayPal', 400));
        }

        // ============================================
        // 🔐 VALIDACIÓN 3: Verificar monto capturado
        // ============================================
        const order_details = await get_paypal_order_details(order_id);

        if (!order_details) {
            payment.status = 'failed';
            await payment.save();
            console.error('[PayPal] No se pudieron obtener detalles de orden:', { order_id });
            return next(new AppError('Error verificando el pago', 500));
        }

        const validation = validate_captured_amount(order_details, expected_price, 'USD');

        if (!validation.is_valid) {
            // ⚠️ ALERTA: Posible intento de fraude
            payment.status = 'failed';
            await payment.save();

            console.error('[PayPal] ⚠️ ALERTA DE SEGURIDAD - Monto no coincide:', {
                order_id,
                user_id: user_id.toString(),
                expected: expected_price,
                captured: validation.captured_amount,
                message: validation.message
            });

            return next(new AppError('Error en la validación del pago. Contacta a soporte.', 400));
        }

        // ============================================
        // ✅ PAGO EXITOSO - Actualizar registros
        // ============================================
        payment.status = 'completed';
        await payment.save();

        const user = await User.findById(user_id);
        if (!user) {
            return next(new AppError('Usuario no encontrado', 404));
        }

        // Actualizar rol y estado de pago
        // Usamos el base_plan para el rol (student o talent)
        const base_plan = PLAN_PRICES[plan_key].base_plan;
        user.role = base_plan;
        user.payment_status = 'active';
        await user.save();

        // Log de auditoría (éxito)
        console.log('[PayPal] ✅ Pago completado:', {
            order_id,
            user_id: user_id.toString(),
            plan: payment.plan,
            amount: validation.captured_amount
        });

        // Generar respuesta con nuevos tokens (permisos actualizados)
        const response_data = await get_login_user_data(user);

        send_response(res, 200, 'Pago exitoso, membresía activada', response_data);

    } catch (error) {
        next(error);
    }
};

// ============================================
// 3️⃣ REPORTAR PAGO OFFLINE (USDT/Zelle)
// ============================================
// @desc    Reportar pago realizado por métodos offline
// @route   POST /api/payments/offline
export const report_offline_payment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reference, plan } = req.body;
        const user_id = req.user!._id;

        if (!reference) {
            return next(new AppError('Falta la referencia de pago', 400));
        }

        // Validar plan
        if (!plan || !isValidPlan(plan)) {
            return next(new AppError(`Plan inválido. Planes válidos: ${VALID_PLANS.join(', ')}`, 400));
        }

        const plan_config = PLAN_PRICES[plan];

        // Verificar que no exista ya un pago pendiente con esta referencia
        const existing_payment = await Payment.findOne({
            offline_reference: reference,
            status: { $in: ['pending', 'completed'] }
        });

        if (existing_payment) {
            return next(new AppError('Esta referencia de pago ya fue reportada', 400));
        }

        // Crear pago pendiente de revisión manual
        await Payment.create({
            user_id,
            amount: plan_config.amount,
            currency: 'USD',
            method: 'offline',
            status: 'pending',
            offline_reference: reference,
            plan: plan,
            period: plan_config.period,
            base_plan: plan_config.base_plan
        });

        // Actualizar usuario a "pending" (admin aprobará manualmente)
        await User.findByIdAndUpdate(user_id, {
            payment_status: 'pending'
            // NO cambiamos el role aún, eso lo hace el admin manualmente
        });

        console.log('[Payment] Pago offline reportado:', {
            user_id: user_id.toString(),
            reference,
            plan,
            amount: plan_config.amount
        });

        send_response(res, 201, 'Pago reportado. Esperando validación del administrador.');
    } catch (error) {
        next(error);
    }
};