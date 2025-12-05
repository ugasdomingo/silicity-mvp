import { Router } from 'express';
import { validate } from '../middleware/validation-middleware';
import { register_schema, login_schema, verify_email_schema, refresh_token_schema } from '../schemas/auth-schemas';
import { register, verify_email, login, refresh } from '../controllers/auth-controller';

const auth_router = Router();

auth_router.post('/register', validate(register_schema), register);
auth_router.post('/verify', validate(verify_email_schema), verify_email)
auth_router.post('/login', validate(login_schema), login)
auth_router.post('/refresh', validate(refresh_token_schema), refresh)

export default auth_router;