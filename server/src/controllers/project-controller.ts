import { Request, Response, NextFunction } from 'express';
import Project, { IProject } from '../models/Project-model';
import ProjectApplication from '../models/Project-application-model';
import StudyGroup from '../models/Study-group-model';
import ProjectDelivery from '../models/Project-delivery-model';
import PeerReview from '../models/Peer-review-model';
import User from '../models/User-model';
import { AppError } from '../utils/app-error';
import { send_response } from '../utils/response-handler';
import { send_email } from '../utils/mailer';

// ==========================================
// 🏢 LOGICA EMPRESA
// ==========================================

// @desc    Crear Proyecto (Con bloqueo de 3 meses)
export const create_project = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;

        // 🛡️ SEGURIDAD: Solo empresas APROBADAS pueden publicar
        if (user.account_status === 'pending_approval') {
            return next(new AppError('Tu cuenta está en revisión. No puedes publicar proyectos hasta ser aprobado.', 403));
        }

        // 1. Validar regla de 3 meses
        const three_months_ago = new Date();
        three_months_ago.setMonth(three_months_ago.getMonth() - 3);

        const recent_project = await Project.findOne({
            company_id: user._id,
            created_at: { $gte: three_months_ago }
        });

        if (recent_project) {
            return next(new AppError('Solo puedes publicar un proyecto cada 3 meses para garantizar calidad.', 400));
        }

        // 2. Crear
        const project = new Project({
            company_id: user._id,
            ...req.body,
            status: 'pending_review' // Siempre entra en revisión primero
        });

        await project.save();

        // 🔔 ALERTA ADMIN (Usando la lógica centralizada de emails)
        // Nota: Asegúrate de que ADMIN_EMAIL esté en tu .env
        const admin_email = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

        await send_email(
            admin_email as string,
            `🚀 Nuevo Proyecto B2B: ${project.title}`,
            'admin-alert',
            {
                alert_title: 'Solicitud de Proyecto Nuevo',
                message_body: 'Una empresa ha enviado una propuesta de proyecto que requiere tu aprobación.',
                details: [
                    { key: 'Empresa', value: user.name },
                    { key: 'Título', value: project.title },
                    { key: 'Estado', value: 'Pendiente de Revisión' }
                ],
                action_url: `${process.env.CLIENT_URL}/dashboard/admin/projects`,
                action_text: 'Revisar Proyecto'
            }
        );

        send_response(res, 201, 'Proyecto enviado a revisión.', project);
    } catch (error) {
        next(error);
    }
};

// @desc    Mis Proyectos (Empresa)
export const get_my_company_projects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user!._id;
        const projects = await Project.find({ company_id: user_id })
            .populate('participating_groups')
            .sort('-created_at');
        send_response(res, 200, 'OK', projects);
    } catch (error) {
        next(error);
    }
};

// @desc    Evaluar Entrega Final (Empresa)
// @route   POST /api/projects/deliveries/:id/evaluate
export const evaluate_delivery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const company_id = req.user!._id
        const delivery_id = req.params.id;
        const { rating, feedback_text, ip_purchase_interested, hiring_interested } = req.body;

        const delivery = await ProjectDelivery.findById(delivery_id).populate('project_id');
        if (!delivery) return next(new AppError('Entrega no encontrada', 404));

        // Validar que el proyecto pertenece a la empresa
        const project = delivery.project_id as any;
        if (project.company_id.toString() !== company_id) {
            return next(new AppError('No tienes permiso para evaluar este proyecto', 403));
        }

        // 1. Actualizar Entrega
        delivery.company_evaluation = {
            status: 'reviewed',
            rating,
            feedback_text
        };
        delivery.outcomes = {
            ip_purchase_interested,
            hiring_interested
        };
        await delivery.save();

        // 2. LOGICA DE REPUTACIÓN (Si es positivo)
        if (rating === 'positive') {
            const group = await StudyGroup.findById(delivery.group_id);

            if (group && group.members.length > 0) {
                // Actualizar a cada miembro
                for (const member_id of group.members) {
                    await User.findByIdAndUpdate(member_id, {
                        $inc: {
                            'reputation.projects_completed': 1,
                            'reputation.positive_reviews': 1
                        }
                    });

                    // Verificar si sube a Top Talent (5 positivas)
                    const updated_user = await User.findById(member_id);
                    if (updated_user && updated_user.reputation.positive_reviews >= 5) {
                        updated_user.reputation.is_top_talent = true;
                        await updated_user.save();
                    }
                }
            }
        }

        send_response(res, 200, 'Evaluación registrada correctamente');
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener entregas de un proyecto específico (Empresa)
export const get_project_deliveries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const company_id = req.user!._id

        // Validar propiedad
        const project = await Project.findById(id);
        if (!project) return next(new AppError('Proyecto no encontrado', 404));

        if (project.company_id !== company_id) {
            return next(new AppError('No tienes permiso para ver estas entregas', 403));
        }

        // Buscar entregas y poblar datos del equipo
        const deliveries = await ProjectDelivery.find({ project_id: id })
            .populate('group_id', 'name members topic') // Traemos el nombre del equipo
            .sort('-submitted_at');

        send_response(res, 200, 'Entregas obtenidas', deliveries);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 🎓 LOGICA TALENTO
// ==========================================

// @desc    Ver Proyectos Abiertos (Tablón)
export const get_open_projects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const projects = await Project.find({ status: 'open' })
            .populate('company_id', 'name company_info.website')
            .sort('-created_at');
        send_response(res, 200, 'OK', projects);
    } catch (error) {
        next(error);
    }
};

// @desc    Postularse
export const apply_to_project = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user!._id
        const project_id = req.params.id;
        const { mode, desired_role, motivation } = req.body;

        const project = await Project.findById(project_id);
        if (!project || project.status !== 'open') return next(new AppError('Proyecto cerrado', 400));

        const existing = await ProjectApplication.findOne({ project_id, user_id });
        if (existing) return next(new AppError('Ya te has postulado', 400));

        await ProjectApplication.create({
            project_id,
            user_id,
            mode,
            desired_role,
            motivation
        });

        send_response(res, 201, 'Postulación enviada');
    } catch (error) {
        next(error);
    }
};

// @desc    Entregar Proyecto (Equipo)
// @route   POST /api/projects/:id/deliver
export const deliver_project = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user!._id
        const project_id = req.params.id;
        const { documentation_link, repo_link, demo_link } = req.body;

        // 1. Buscar en qué grupo de este proyecto está el usuario
        const group = await StudyGroup.findOne({
            project_reference: project_id,
            members: user_id,
            is_project_team: true
        });

        if (!group) return next(new AppError('No formas parte de un equipo activo en este proyecto', 403));

        // 2. Crear entrega
        const delivery = new ProjectDelivery({
            project_id,
            group_id: group._id,
            documentation_link,
            repo_link,
            demo_link
        });
        await delivery.save();

        // 3. Obtener datos para notificaciones
        const project = await Project.findById(project_id);
        if (!project) return next(new AppError('Proyecto no encontrado', 404));

        const company_owner = await User.findById(project.company_id);
        if (!company_owner) return next(new AppError('Empresa propietaria no encontrada', 404));

        // 4. 🔔 NOTIFICACIONES

        // A) Al Admin (Control)
        const admin_email = process.env.SMTP_USER as string;
        await send_email(
            admin_email,
            `📦 Entrega de Proyecto: ${group.name}`,
            'admin-alert',
            {
                alert_title: 'Hito Cumplido: Proyecto Entregado',
                message_body: 'Un equipo ha completado y enviado sus entregables finales.',
                details: [
                    { key: 'Equipo', value: group.name },
                    { key: 'Proyecto', value: project.title },
                    { key: 'Empresa', value: company_owner.name },
                    { key: 'Repositorio', value: repo_link || 'N/A' }
                ],
                action_url: `${process.env.CLIENT_URL}/app/dashboard/admin/deliveries`,
                action_text: 'Ver Entrega Admin'
            }
        );

        // B) A la Empresa (Cliente)
        await send_email(
            company_owner.email,
            `📦 Nueva Entrega Recibida: ${project.title}`,
            'company-delivery-alert',
            {
                company_name: company_owner.name,
                project_title: project.title,
                group_name: group.name,
                submission_date: new Date().toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric'
                }),
                // Link directo al dashboard de la empresa para evaluar
                action_url: `${process.env.CLIENT_URL}/app/dashboard/company/projects/${project._id}/deliveries`
            }
        );

        send_response(res, 201, 'Proyecto entregado exitosamente. Esperando evaluación.');
    } catch (error) {
        next(error);
    }
};

// @desc    Evaluación de Pares (Peer Review)
// @route   POST /api/projects/:id/peer-review
export const submit_peer_review = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reviewer_id = req.user!._id
        const project_id = req.params.id;
        const { reviewed_id, ratings, comment } = req.body;

        // Validar que ambos estén en el mismo equipo del proyecto
        const group = await StudyGroup.findOne({
            project_reference: project_id,
            is_project_team: true,
            members: { $all: [reviewer_id, reviewed_id] }
        });

        if (!group) return next(new AppError('No puedes evaluar a este usuario (no son equipo)', 403));

        // Evitar duplicados
        const existing = await PeerReview.findOne({ project_id, reviewer_id, reviewed_id });
        if (existing) return next(new AppError('Ya evaluaste a este compañero', 400));

        await PeerReview.create({
            project_id,
            reviewer_id,
            reviewed_id,
            ratings,
            comment
        });

        send_response(res, 201, 'Evaluación de par registrada');
    } catch (error) {
        next(error);
    }
};
