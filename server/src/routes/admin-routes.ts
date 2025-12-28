import { Router } from 'express';
import { protect, restrict_to } from '../middleware/auth';

// Controllers
import {
    get_dashboard_stats,
    get_users_list,
    approve_company,
    reject_company,
    suspend_user,
    reactivate_user,
    get_pending_payments,
    approve_offline_payment,
    reject_offline_payment,
    get_pending_projects
} from '../controllers/admin-user-controller';

import {
    get_pending_applications,
    evaluate_application
} from '../controllers/admin-scholarship-controller';

import {
    get_project_applications,
    form_project_team,
    approve_project
} from '../controllers/admin-project-controller';

const admin_router = Router();

// ============================================
// 🔒 PROTECCIÓN GLOBAL - Solo Admin
// ============================================
admin_router.use(protect);
admin_router.use(restrict_to('Admin'));

// ============================================
// 📊 DASHBOARD
// ============================================
admin_router.get('/stats', get_dashboard_stats);

// ============================================
// 👥 GESTIÓN DE USUARIOS
// ============================================
admin_router.get('/users', get_users_list);
admin_router.patch('/users/:id/approve', approve_company);
admin_router.patch('/users/:id/reject', reject_company);
admin_router.patch('/users/:id/suspend', suspend_user);
admin_router.patch('/users/:id/reactivate', reactivate_user);

// ============================================
// 💳 GESTIÓN DE PAGOS OFFLINE
// ============================================
admin_router.get('/payments/pending', get_pending_payments);
admin_router.patch('/payments/:id/approve', approve_offline_payment);
admin_router.patch('/payments/:id/reject', reject_offline_payment);

// ============================================
// 🎓 GESTIÓN DE BECAS
// ============================================
admin_router.get('/scholarships/applications', get_pending_applications);
admin_router.patch('/scholarships/applications/:id/evaluate', evaluate_application);

// ============================================
// 🚀 GESTIÓN DE PROYECTOS
// ============================================
admin_router.get('/projects/pending', get_pending_projects);
admin_router.get('/projects/:id/applications', get_project_applications);
admin_router.post('/projects/:id/form-team', form_project_team);
admin_router.patch('/projects/:id/approve', approve_project);

export default admin_router;