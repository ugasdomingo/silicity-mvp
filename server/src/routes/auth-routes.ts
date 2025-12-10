import { Router } from 'express';
import { validate } from '../middleware/validation-middleware';
import { auth_limiter } from '../middleware/auth-limiter';
import { register_schema, login_schema, verify_email_schema, refresh_token_schema } from '../schemas/auth-schemas';
import { register, verify_email, login, refresh } from '../controllers/auth-controller';

const auth_router = Router();

auth_router.post('/register', auth_limiter, validate(register_schema), register);
auth_router.post('/verify', auth_limiter, validate(verify_email_schema), verify_email)
auth_router.post('/login', auth_limiter, validate(login_schema), login)
auth_router.post('/refresh', validate(refresh_token_schema), refresh)

export default auth_router;