import { Router } from 'express';
import { get_pending_applications, evaluate_application } from '../controllers/admin-scholarship-controller';
import { protect, restrict_to } from '../middleware/auth';

const admin_scholarship_router = Router();
admin_scholarship_router.use(protect);
admin_scholarship_router.use(restrict_to('Admin')); // Todo aquí es solo Admin

admin_scholarship_router.get('/applications', get_pending_applications);
admin_scholarship_router.patch('/applications/:id/evaluate', evaluate_application);

export default admin_scholarship_router;