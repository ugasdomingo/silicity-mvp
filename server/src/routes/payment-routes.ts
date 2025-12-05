import { Router } from 'express';
import { validate } from '../middleware/validation-middleware';
import * as schemas from '../schemas/payment-schemas';
import { create_paypal_order, capture_paypal_order, report_offline_payment } from '../controllers/payment-controller';
import { protect } from '../middleware/auth';

const payment_router = Router();

payment_router.use(protect);
payment_router.post('/offline', validate(schemas.offline_payment_schema), report_offline_payment);
payment_router.post('/paypal/create-order', validate(schemas.create_paypal_order_schema), create_paypal_order);
payment_router.post('/paypal/capture-order', validate(schemas.capture_paypal_order_schema), capture_paypal_order);

export default payment_router;