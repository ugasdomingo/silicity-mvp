import { Router } from 'express';
import {
    create_project,
    get_open_projects,
    apply_to_project,
    get_my_company_projects,
    deliver_project,
    evaluate_delivery,
    submit_peer_review
} from '../controllers/project-controller';
import {
    get_project_applications,
    form_project_team,
    approve_project
} from '../controllers/admin-project-controller';
import { protect, restrict_to } from '../middleware/auth';

const router = Router();

// --- PUBLICO (Talento Logueado) ---
router.get('/', protect, get_open_projects);
router.post('/:id/apply', protect, restrict_to('talent'), apply_to_project);
router.post('/:id/deliver', protect, restrict_to('talent'), deliver_project);
router.post('/:id/peer-review', protect, restrict_to('talent'), submit_peer_review);

// --- EMPRESA ---
router.post('/', protect, restrict_to('company', 'vc'), create_project);
router.get('/my-company-projects', protect, restrict_to('company', 'vc'), get_my_company_projects);
router.post('/deliveries/:id/evaluate', protect, restrict_to('company', 'vc'), evaluate_delivery);

// --- ADMIN ---
router.get('/:id/applications', protect, restrict_to('Admin'), get_project_applications);
router.post('/:id/form-team', protect, restrict_to('Admin'), form_project_team);
router.patch('/:id/approve', protect, restrict_to('Admin'), approve_project);

export default router;