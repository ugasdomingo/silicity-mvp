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
import { validate } from '../middleware/validation-middleware';
import { create_project_schema, apply_project_schema, deliver_project_schema, evaluate_delivery_schema, peer_review_schema, form_team_schema, approve_project_schema } from '../schemas/project-schemas';
import { protect, restrict_to } from '../middleware/auth';

const project_router = Router();

// --- PUBLICO (Talento Logueado) ---
project_router.get('/', protect, get_open_projects);
project_router.post('/:id/apply', protect, restrict_to('talent'), validate(apply_project_schema), apply_to_project);
project_router.post('/:id/deliver', protect, restrict_to('talent'), validate(deliver_project_schema), deliver_project);
project_router.post('/:id/peer-review', protect, restrict_to('talent'), validate(peer_review_schema), submit_peer_review);

// --- EMPRESA ---
project_router.post('/', protect, restrict_to('company', 'vc'), validate(create_project_schema), create_project);
project_router.get('/my-company-projects', protect, restrict_to('company', 'vc'), get_my_company_projects);
project_router.post('/deliveries/:id/evaluate', protect, restrict_to('company', 'vc'), validate(evaluate_delivery_schema), evaluate_delivery);
project_router.get('/deliveries/:id', protect, restrict_to('company', 'vc'), get_project_deliveries);

// --- ADMIN ---
project_router.get('/:id/applications', protect, restrict_to('Admin'), get_project_applications);
project_router.post('/:id/form-team', protect, restrict_to('Admin'), validate(form_team_schema), form_project_team);
project_router.patch('/:id/approve', protect, restrict_to('Admin'), validate(approve_project_schema), approve_project);

export default project_router;