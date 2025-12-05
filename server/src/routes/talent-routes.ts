import { Router } from 'express';
import { search_talent, express_interest } from '../controllers/talent-controller';
import { protect, restrict_to } from '../middleware/auth';

const talent_router = Router();
talent_router.use(protect);

talent_router.get('/', restrict_to('company', 'vc', 'Admin'), search_talent);
talent_router.post('/:id/interest', restrict_to('company', 'vc'), express_interest);

export default talent_router;