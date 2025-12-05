import { Request, Response, NextFunction } from 'express';
import User from '../models/User-model';
import Project from '../models/Project-model';
import ProjectApplication from '../models/Project-application-model';
import TalentInterest from '../models/Talent-interest-model';
import { AppError } from '../utils/app-error';
import { send_response } from '../utils/response-handler';
import { send_email } from '../utils/mailer';

// @desc    Buscar Talento (Lógica Híbrida: Postulantes + Top Talent)
export const search_talent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const company_id = (req as any).user_id;
        const { skill, role } = req.query;

        // 1. Identificar Postulantes (Talento Interesado en la Empresa)
        // Buscamos proyectos de esta empresa
        const my_projects = await Project.find({ company_id }).select('_id');
        const my_project_ids = my_projects.map(p => p._id);

        // Buscamos aplicaciones a esos proyectos
        const applications = await ProjectApplication.find({
            project_id: { $in: my_project_ids }
        }).select('user_id');

        const applicant_user_ids = applications.map(app => app.user_id);

        // 2. Construir Query Principal
        const search_query: any = {
            role: { $in: ['talent', 'student'] },
            payment_status: 'active',
            _id: { $ne: company_id } // Excluirse a sí mismo por si acaso
        };

        // Filtros de texto (Skills / Role)
        if (skill) {
            search_query['profile.skills'] = { $in: [new RegExp(skill as string, 'i')] };
        }
        if (role) {
            search_query['profile.headline'] = new RegExp(role as string, 'i');
        }

        // 3. Ejecutar búsqueda en Base de Datos
        // Traemos candidatos que sean postulantes O cumplan requisitos globales
        const candidates = await User.find({
            ...search_query,
            $or: [
                { _id: { $in: applicant_user_ids } }, // Es postulante (no importa status psych ni reviews)
                {
                    // Es Global Showcase (Estricto)
                    'psych_evaluation.status': 'passed', // Solo aprobados por Lucía
                    'reputation.positive_reviews': { $gte: 5 } // Mínimo 5 reviews positivas
                }
            ]
        })
            .select('name email profile reputation psych_evaluation.status role company_info')
            .lean(); // Convertir a objeto JS puro para poder agregar propiedades

        // 4. Procesar y Marcar Resultados
        const processed_talents = candidates.map((user: any) => {
            const is_applicant = applicant_user_ids.some(id => id.toString() === user._id.toString());

            // Re-validar condición showcase por si entró solo por ser applicant
            const is_showcase =
                user.psych_evaluation?.status === 'passed' &&
                (user.reputation?.positive_reviews || 0) >= 5;

            return {
                _id: user._id,
                name: user.name,
                headline: user.profile?.headline || 'Talento Silicity',
                skills: user.profile?.skills || [],
                bio: user.profile?.bio,
                avatar: user.profile?.avatar,
                // Flags para el frontend
                is_applicant,
                is_showcase,
                // Ocultar datos sensibles si no hay match aceptado (lógica futura)
                psych_status: user.psych_evaluation?.status
            };
        });

        // Ordenar: Postulantes primero
        processed_talents.sort((a, b) => {
            if (a.is_applicant && !b.is_applicant) return -1;
            if (!a.is_applicant && b.is_applicant) return 1;
            return 0;
        });

        send_response(res, 200, 'Resultados de búsqueda', processed_talents);
    } catch (error) {
        next(error);
    }
};

// ... (express_interest se mantiene igual que en la versión anterior)
export const express_interest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const company_id = (req as any).user_id;
        const talent_id = req.params.id;
        const { message } = req.body;

        const talent = await User.findById(talent_id);
        if (!talent) return next(new AppError('Talento no encontrado', 404));

        const existing = await TalentInterest.findOne({ company_id, talent_id, status: 'pending' });
        if (existing) return next(new AppError('Ya has enviado una solicitud a este talento', 400));

        await TalentInterest.create({
            company_id,
            talent_id,
            message,
            status: 'pending'
        });

        const company = await User.findById(company_id);

        await send_email(
            talent.email,
            `🚀 ${company?.name} está interesada en tu perfil`,
            'talent-interest',
            {
                user_name: talent.name,
                company_name: company?.name,
                company_website: company?.company_info?.website || 'N/A',
                message: message || 'Nos gustaría conocerte para una oportunidad.',
                action_url: `${process.env.CLIENT_URL}/app/dashboard`
            }
        );

        send_response(res, 201, 'Solicitud de interés enviada');
    } catch (error) {
        next(error);
    }
};