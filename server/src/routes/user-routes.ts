import { Router } from 'express';
import { validate } from '../middleware/validation-middleware';
import { update_profile_schema, schedule_psych_schema } from '../schemas/user-schemas';
import { get_my_profile, update_my_profile, schedule_psych_eval, get_my_interests, respond_to_interest } from '../controllers/user-controller';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/me', get_my_profile);
router.patch('/me', validate(update_profile_schema), update_my_profile);
router.post('/schedule-psych', validate(schedule_psych_schema), schedule_psych_eval);
router.get('/interests', get_my_interests);
router.patch('/interests/:id', respond_to_interest);

export default router;