import { z } from 'zod';

export const create_paypal_order_schema = z.object({
    body: z.object({
        plan: z.enum(['student', 'talent']),
    }),
});

export const capture_paypal_order_schema = z.object({
    body: z.object({
        order_id: z.string().min(1),
    }),
});

export const offline_payment_schema = z.object({
    body: z.object({
        reference: z.string().min(5, 'Referencia muy corta'),
        plan: z.enum(['student', 'talent']),
    }),
});