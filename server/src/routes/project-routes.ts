import { Router } from 'express';
import {
    create_project,
    get_open_projects,
    apply_to_project,
    get_my_company_projects,
    deliver_project,
    evaluate_delivery,
    submit_peer_review,
    get_project_deliveries
} from '../controllers/project-controller';
import {
    get_project_applications,
    form_project_team,
    approve_project,
} from '../controllers/admin-project-controller';
import { protect, restrict_to } from '../middleware/auth';

const project_router = Router();

// --- PUBLICO (Talento Logueado) ---
project_router.get('/', protect, get_open_projects);
project_router.post('/:id/apply', protect, restrict_to('talent'), apply_to_project);
project_router.post('/:id/deliver', protect, restrict_to('talent'), deliver_project);
project_router.post('/:id/peer-review', protect, restrict_to('talent'), submit_peer_review);

// --- EMPRESA ---
project_router.post('/', protect, restrict_to('company', 'vc'), create_project);
project_router.get('/my-company-projects', protect, restrict_to('company', 'vc'), get_my_company_projects);
project_router.post('/deliveries/:id/evaluate', protect, restrict_to('company', 'vc'), evaluate_delivery);
project_router.get('/deliveries/:id', protect, restrict_to('company', 'vc'), get_project_deliveries);

// --- ADMIN ---
project_router.get('/:id/applications', protect, restrict_to('Admin'), get_project_applications);
project_router.post('/:id/form-team', protect, restrict_to('Admin'), form_project_team);
project_router.patch('/:id/approve', protect, restrict_to('Admin'), approve_project);

export default project_router;