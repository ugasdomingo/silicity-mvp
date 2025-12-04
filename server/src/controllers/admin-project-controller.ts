import { Request, Response, NextFunction } from 'express';
import Project from '../models/Project-model';
import ProjectApplication from '../models/Project-application-model';
import StudyGroup from '../models/Study-group-model';
import { AppError } from '../utils/app-error';
import { send_response } from '../utils/response-handler';

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

// @desc    Aprobar Proyecto (Publicar)
export const approve_project = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { status: 'open' },
            { new: true }
        );
        send_response(res, 200, 'Proyecto aprobado y publicado', project);
    } catch (error) {
        next(error);
    }
};