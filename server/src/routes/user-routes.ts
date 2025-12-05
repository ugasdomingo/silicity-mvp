import { Router } from 'express';
import { get_my_profile, update_my_profile, schedule_psych_eval, get_my_interests, respond_to_interest } from '../controllers/user-controller';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/me', get_my_profile);
router.patch('/me', update_my_profile);
router.post('/schedule-psych', schedule_psych_eval); // Nueva ruta
router.get('/interests', get_my_interests);
router.patch('/interests/:id', respond_to_interest);

export default router;