import { Router } from 'express';
import { validate } from '../middleware/validation-middleware';
import { create_scholarship_schema, apply_scholarship_schema } from '../schemas/scholarship-schemas';
import { get_all_scholarships, create_scholarship, apply_to_scholarship, get_my_applications, approved_applications } from '../controllers/scholarship-controller';
import { protect, restrict_to } from '../middleware/auth';
import { AppError } from '../utils/app-error';
import User from '../models/User-model';

const scholarship_router = Router();

// Middleware: Verificar que pagó
const require_membership = async (req: any, res: any, next: any) => {
    try {
        const user = await User.findById(req.user.user_id);
        // Permitir si es Admin, Student/Talent Activo o Empresa/VC en trial/active
        if (user && (user.payment_status === 'active' || user.payment_status === 'free_trial' || user.role === 'Admin')) {
            return next();
        }
        return next(new AppError('Necesitas una membresía activa para realizar esta acción', 403));
    } catch (error) {
        next(error);
    }
};

// Rutas Públicas (Vitrina)
scholarship_router.get('/', get_all_scholarships);

// Rutas Protegidas
scholarship_router.use(protect);
scholarship_router.get('/my-applications', get_my_applications);
scholarship_router.post('/:id/apply', require_membership, validate(apply_scholarship_schema), apply_to_scholarship);

//Solo Admin
scholarship_router.post('/', restrict_to('Admin'), validate(create_scholarship_schema), create_scholarship);
scholarship_router.get('/approved-applications', restrict_to('Admin'), approved_applications);

export default scholarship_router;