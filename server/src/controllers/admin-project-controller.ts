import { Request, Response, NextFunction } from 'express';
import Project from '../models/Project-model';
import ProjectApplication from '../models/Project-application-model';
import StudyGroup from '../models/Study-group-model';
import { AppError } from '../utils/app-error';
import { send_response } from '../utils/response-handler';
import { send_email } from '../utils/mailer';
import User from '../models/User-model';

// @desc    Ver postulaciones de un proyecto
export const get_project_applications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.params;
        const applications = await ProjectApplication.find({ project_id: projectId })
            .populate('user_id', 'name email profile.headline profile.skills'); // Datos para decidir

        send_response(res, 200, 'Postulaciones', applications);
    } catch (error) {
        next(error);
    }
};

// @desc    Armar Equipo (Crear StudyGroup Oculto)
// @route   POST /api/admin/projects/:id/form-team
export const form_project_team = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const project_id = req.params.id;
        const { name, members_data } = req.body;
        // members_data = [{ userId: '...', role: 'Frontend' }, { userId: '...', role: 'UX' }]

        const project = await Project.findById(project_id);
        if (!project) return next(new AppError('Proyecto no encontrado', 404));

        const user_ids = members_data.map((m: any) => m.userId);

        // 1. Crear el StudyGroup Cerrado/Oculto
        const team = await StudyGroup.create({
            name: name || `Equipo - ${project.title}`,
            topic: 'Proyecto Real',
            description: `Equipo oficial para el proyecto: ${project.title}`,
            members: user_ids,
            is_project_team: true,
            project_reference: project_id,
            status: 'closed',
            visibility: 'hidden',
            // admin_id podría ser null o tú mismo
        });

        // 2. Vincular equipo al proyecto
        project.participating_groups.push(team._id as any);
        project.status = 'in_progress'; // Cambiamos estado si es el primer equipo (opcional)
        await project.save();

        // 3. Actualizar estado de las postulaciones a "assigned"
        await ProjectApplication.updateMany(
            { project_id, user_id: { $in: user_ids } },
            { status: 'assigned' }
        );

        // Nota: Aquí se enviaría email a los seleccionados: "Has sido asignado al Equipo X"

        send_response(res, 201, 'Equipo formado exitosamente', team);
    } catch (error) {
        next(error);
    }
};

// @desc    Aprobar Proyecto B2B (Publicarlo en el tablón)
export const approve_project = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id);
        if (!project) return next(new AppError('Proyecto no encontrado', 404));

        project.status = 'open'; // Se abre a postulaciones
        await project.save();

        // Notificar a la Empresa
        const company = await User.findById(project.company_id);
        if (company) {
            await send_email(
                company.email,
                `🚀 Proyecto Aprobado: ${project.title}`,
                'admin-alert', // Reusamos template o creamos uno específico 'project-approved'
                {
                    alert_title: 'Tu Proyecto está en vivo',
                    message_body: 'Hemos revisado y aprobado tu proyecto. El talento ya puede empezar a postularse.',
                    details: [{ key: 'Proyecto', value: project.title }],
                    action_url: `${process.env.CLIENT_URL}/dashboard/company/projects`,
                    action_text: 'Ver Proyecto'
                }
            );
        }

        send_response(res, 200, 'Proyecto aprobado y publicado.', project);
    } catch (error) {
        next(error);
    }
};

// @desc    Formar Equipo de Proyecto (Aprobar Postulantes)
// @route   POST /api/admin/projects/:id/team
export const approve_project_team = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const project_id = req.params.id;
        const { selected_applicant_ids } = req.body; // Array de IDs de usuarios [id1, id2, id3]

        if (!selected_applicant_ids || selected_applicant_ids.length === 0) {
            return next(new AppError('Debes seleccionar al menos un postulante', 400));
        }

        const project = await Project.findById(project_id);
        if (!project) return next(new AppError('Proyecto no encontrado', 404));

        // 1. Actualizar estado de las aplicaciones
        await ProjectApplication.updateMany(
            { project_id, user_id: { $in: selected_applicant_ids } },
            { status: 'accepted' }
        );

        // Rechazar a los demás (Opcional, depende de tu flujo)
        // await ProjectApplication.updateMany(
        //     { project_id, user_id: { $nin: selected_applicant_ids } },
        //     { status: 'rejected' }
        // );

        // 2. CREAR EL GRUPO DE TRABAJO (Aquí está la magia)
        // Incluimos a los seleccionados Y a la empresa dueña
        const team_members = [...selected_applicant_ids, project.company_id];

        const new_group = await StudyGroup.create({
            name: `Team: ${project.title}`,
            topic: 'Project Development',
            description: `Grupo de trabajo oficial para el proyecto ${project.title}`,
            members: team_members,
            admin_id: req.user!._id, // El Admin crea el grupo inicialmente
            status: 'closed', // Privado
            visibility: 'private',
            is_project_team: true,
            project_reference: project._id // Vinculamos para referencias futuras
        });

        // Agregar el grupo al array del proyecto
        project.participating_groups.push(new_group._id as any);
        project.status = 'in_progress'; // El proyecto arranca
        await project.save();

        // 3. Notificaciones Masivas
        // A) A los estudiantes seleccionados
        for (const user_id of selected_applicant_ids) {
            const user = await User.findById(user_id);
            if (user) {
                await send_email(
                    user.email,
                    `🎉 ¡Fuiste seleccionado! Proyecto: ${project.title}`,
                    'admin-alert', // Idealmente usar template 'application-accepted'
                    {
                        alert_title: '¡Felicidades, estás dentro!',
                        message_body: 'Has sido seleccionado para participar en este proyecto. Ya tienes acceso al grupo de trabajo.',
                        details: [{ key: 'Proyecto', value: project.title }],
                        action_url: `${process.env.CLIENT_URL}/dashboard/student/study-groups/${new_group._id}`,
                        action_text: 'Ir al Workspace'
                    }
                );
            }
        }

        // B) A la Empresa (Tu equipo está listo)
        const company = await User.findById(project.company_id);
        if (company) {
            await send_email(
                company.email,
                `🚀 Equipo Formado: ${project.title}`,
                'admin-alert',
                {
                    alert_title: 'El talento está listo',
                    message_body: 'Hemos seleccionado a los mejores candidatos. Se ha creado un grupo de trabajo donde también fuiste incluido.',
                    details: [{ key: 'Miembros', value: `${selected_applicant_ids.length} talentos` }],
                    action_url: `${process.env.CLIENT_URL}/dashboard/company/projects/${project._id}`,
                    action_text: 'Ver Equipo'
                }
            );
        }

        send_response(res, 201, 'Equipo formado y grupo de trabajo creado exitosamente.', new_group);
    } catch (error) {
        next(error);
    }
};