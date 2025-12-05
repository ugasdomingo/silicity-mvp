import { z } from 'zod';

export const register_schema = z.object({
    body: z.object({
        name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
        email: z.email('Email inválido'),
        password: z.string()
            .min(8, 'La contraseña debe tener al menos 8 caracteres')
            .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
            .regex(/[0-9]/, 'Debe contener al menos un número'),
        role: z.enum(['user', 'student', 'talent', 'company', 'vc', 'Admin']).optional(),
        website: z.url().optional().or(z.literal('')), // Opcional pero si viene, debe ser URL
        terms_and_privacy_accepted: z.literal(true, {
            error: 'Debes aceptar los términos y privacidad',
        }),
    }),
});

export const login_schema = z.object({
    body: z.object({
        email: z.email('Email inválido'),
        password: z.string().min(1, 'La contraseña es requerida'),
    }),
});

export const verify_email_schema = z.object({
    body: z.object({
        email: z.email('Email inválido'),
        code: z.string().length(6, 'El código debe tener 6 dígitos').regex(/^\d+$/, 'Solo números'),
    }),
});

export const refresh_token_schema = z.object({
    body: z.object({
        refresh_token: z.string().min(1, 'Token de refresco requerido'),
    }),
});