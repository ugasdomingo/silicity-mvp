import { Router } from 'express';
import { create_paypal_order, capture_paypal_order, report_offline_payment } from '../controllers/payment-controller';
import { protect } from '../middleware/auth';

const payment_router = Router();

payment_router.use(protect);
payment_router.post('/offline', report_offline_payment);
payment_router.post('/paypal/create-order', create_paypal_order);
payment_router.post('/paypal/capture-order', capture_paypal_order);

export default payment_router;