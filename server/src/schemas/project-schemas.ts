import { z } from 'zod';
import { objectIdSchema } from './common-schemas';

export const create_project_schema = z.object({
    body: z.object({
        title: z.string().min(5, 'Título muy corto').max(100),
        description: z.string().min(20, 'Descripción detallada requerida'),
        requirements: z.array(z.string()).min(1, 'Agrega al menos un requisito'),
    }),
});

export const apply_project_schema = z.object({
    params: z.object({ id: objectIdSchema }),
    body: z.object({
        mode: z.enum(['solo', 'team']),
        desired_role: z.string().min(2, 'Define tu rol'),
        motivation: z.string().min(20, 'Explica tu motivación (mín 20 caracteres)'),
    }),
});

export const deliver_project_schema = z.object({
    params: z.object({ id: objectIdSchema }),
    body: z.object({
        documentation_link: z.url('Enlace inválido'),
        repo_link: z.url('Enlace inválido').optional().or(z.literal('')),
        demo_link: z.url('Enlace inválido').optional().or(z.literal('')),
    }),
});

export const evaluate_delivery_schema = z.object({
    params: z.object({ id: objectIdSchema }), // delivery_id
    body: z.object({
        rating: z.enum(['positive', 'improvable', 'negative']),
        feedback_text: z.string().min(10, 'El feedback es obligatorio'),
        ip_purchase_interested: z.boolean(),
        hiring_interested: z.boolean(),
    }),
});

export const peer_review_schema = z.object({
    params: z.object({ id: objectIdSchema }), // project_id
    body: z.object({
        reviewed_id: objectIdSchema,
        ratings: z.object({
            communication: z.number().min(1).max(5),
            collaboration: z.number().min(1).max(5),
            technical_contribution: z.number().min(1).max(5),
        }),
        comment: z.string().min(10, 'Comentario requerido'),
    }),
});

// Admin: Formar equipo
export const form_team_schema = z.object({
    params: z.object({ id: objectIdSchema }),
    body: z.object({
        name: z.string().min(3),
        members_data: z.array(z.object({
            userId: objectIdSchema,
            role: z.string() // Rol asignado en el equipo
        })).min(1, 'Mínimo 1 miembro'),
    }),
});

export const approve_project_schema = z.object({
    params: z.object({ id: objectIdSchema }),
    body: z.object({
        // Podríamos validar si se envía un status específico, o dejarlo vacío si solo es un "trigger"
        status: z.enum(['open', 'closed']).optional(),
    }).strict(), // .strict() rechaza propiedades extra no definidas
});