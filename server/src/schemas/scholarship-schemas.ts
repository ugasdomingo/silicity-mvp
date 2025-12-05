import { z } from 'zod';
import { objectIdSchema } from './common-schemas';

export const create_scholarship_schema = z.object({
    body: z.object({
        title: z.string().min(5),
        provider: z.string().min(2),
        description: z.string().min(10),
        requirements: z.array(z.string()),
        deadline: z.iso.datetime(), // Validamos formato ISO fecha
        spots: z.number().int().positive(),
        image_url: z.url().optional(),
        auto_approve: z.boolean().optional(),
    }),
});

export const apply_scholarship_schema = z.object({
    params: z.object({ id: objectIdSchema }),
    body: z.object({
        motivation: z.string().optional(), // Puede ser opcional si es auto-approve, pero lo validamos en controller si es required
    }),
});