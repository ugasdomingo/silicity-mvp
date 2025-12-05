import { Router } from 'express';
import { handle_cal_webhook, get_my_appointments } from '../controllers/appointment-controller';
import { protect } from '../middleware/auth';

const appointment_router = Router();

// Webhook (Público pero verificado por firma)
appointment_router.post('/webhook', handle_cal_webhook);

// Rutas protegidas (Usuario)
appointment_router.get('/', protect, get_my_appointments);

export default appointment_router;