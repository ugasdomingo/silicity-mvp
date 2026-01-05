import { z } from 'zod';

// ============================================
// 📋 PLANES VÁLIDOS
// ============================================
const VALID_PLANS = [
    'student_quarterly',
    'student_yearly',
    'talent_quarterly',
    'talent_yearly'
] as const;

// ============================================
// 🔐 SCHEMAS
// ============================================

/**
 * Schema para crear orden de PayPal
 * POST /api/payments/paypal/create-order
 */
export const create_paypal_order_schema = z.object({
    body: z.object({
        plan: z.enum(VALID_PLANS, {
            errorMap: () => ({
                message: `Plan inválido. Planes válidos: ${VALID_PLANS.join(', ')}`
            })
        }),
    }),
});

/**
 * Schema para capturar orden de PayPal
 * POST /api/payments/paypal/capture-order
 */
export const capture_paypal_order_schema = z.object({
    body: z.object({
        order_id: z.string().min(1, 'Order ID requerido'),
    }),
});

/**
 * Schema para reportar pago offline
 * POST /api/payments/offline
 */
export const offline_payment_schema = z.object({
    body: z.object({
        reference: z.string()
            .min(5, 'Referencia muy corta (mínimo 5 caracteres)')
            .max(100, 'Referencia muy larga (máximo 100 caracteres)'),
        plan: z.enum(VALID_PLANS, {
            errorMap: () => ({
                message: `Plan inválido. Planes válidos: ${VALID_PLANS.join(', ')}`
            })
        }),
    }),
});

// ============================================
// 📤 TIPOS EXPORTADOS
// ============================================
export type CreatePaypalOrderInput = z.infer<typeof create_paypal_order_schema>;
export type CapturePaypalOrderInput = z.infer<typeof capture_paypal_order_schema>;
export type OfflinePaymentInput = z.infer<typeof offline_payment_schema>;