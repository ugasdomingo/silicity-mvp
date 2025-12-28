import { Router } from 'express';
import { validate } from '../middleware/validation-middleware';
import { auth_limiter } from '../middleware/auth-limiter';
import {
    register_schema,
    login_schema,
    verify_email_schema,
    refresh_token_schema,
    resend_code_schema,
    forgot_password_schema,
    reset_password_schema
} from '../schemas/auth-schemas';
import {
    register,
    verify_email,
    login,
    refresh,
    resend_verification_code,
    forgot_password,
    reset_password
} from '../controllers/auth-controller';

const auth_router = Router();

// ============================================
// 🔐 REGISTRO Y VERIFICACIÓN
// ============================================
auth_router.post('/register', auth_limiter, validate(register_schema), register);
auth_router.post('/verify', auth_limiter, validate(verify_email_schema), verify_email);
auth_router.post('/resend-code', auth_limiter, validate(resend_code_schema), resend_verification_code);

// ============================================
// 🔑 LOGIN Y REFRESH
// ============================================
auth_router.post('/login', auth_limiter, validate(login_schema), login);
auth_router.post('/refresh', auth_limiter, validate(refresh_token_schema), refresh);

// ============================================
// 🔄 RECUPERACIÓN DE CONTRASEÑA
// ============================================
auth_router.post('/forgot-password', auth_limiter, validate(forgot_password_schema), forgot_password);
auth_router.post('/reset-password', auth_limiter, validate(reset_password_schema), reset_password);

export default auth_router;