import { Router } from 'express';
import { register, verify_email, login, refresh } from '../controllers/auth-controller';

const auth_router = Router();

auth_router.post('/register', register);
auth_router.post('/verify', verify_email)
auth_router.post('/login', login)
auth_router.post('/refresh', refresh)

export default auth_router;