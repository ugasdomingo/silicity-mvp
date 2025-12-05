import { z } from 'zod';

export const update_profile_schema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),

        // Perfil Talento
        profile: z.object({
            headline: z.string().max(100).optional(),
            bio: z.string().max(500).optional(),
            skills: z.array(z.string()).optional(),
            social_links: z.object({
                linkedin: z.url().optional().or(z.literal('')),
                github: z.url().optional().or(z.literal('')),
                portfolio: z.url().optional().or(z.literal('')),
            }).optional(),
        }).optional(),

        // Perfil Empresa
        company_info: z.object({
            description: z.string().max(1000).optional(),
            website: z.url().optional().or(z.literal('')),
        }).optional(),
    }),
});

export const schedule_psych_schema = z.object({
    body: z.object({}).strict().optional(),
});