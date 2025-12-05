import { Router } from 'express';
import {
    create_group,
    get_open_groups,
    join_group,
    leave_group,
    get_group_messages,
    graduate_project_team
} from '../controllers/study-group-controller';
import { protect } from '../middleware/auth';

const study_group_router = Router();

// Todas las rutas requieren login
study_group_router.use(protect);

study_group_router.post('/', create_group);
study_group_router.get('/', get_open_groups);

// Acciones sobre grupo específico
study_group_router.post('/:id/join', join_group);
study_group_router.post('/:id/leave', leave_group);
study_group_router.get('/:id/messages', get_group_messages);

// Acción especial de networking
study_group_router.patch('/:id/graduate', graduate_project_team);

export default study_group_router;