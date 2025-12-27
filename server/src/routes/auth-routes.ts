import { Router } from 'express';
import { validate } from '../middleware/validation-middleware';
import { auth_limiter } from '../middleware/auth-limiter';
import {
    register_schema,
    login_schema,
    verify_email_schema,
    refresh_token_schema,
    resend_code_schema
} from '../schemas/auth-schemas';
import {
    register,
    verify_email,
    login,
    refresh,
    resend_verification_code
} from '../controllers/auth-controller';

const auth_router = Router();

// ============================================
// 🔐 RUTAS DE AUTENTICACIÓN
// ============================================

// Registro - Rate limited para prevenir spam de cuentas
auth_router.post('/register', auth_limiter, validate(register_schema), register);

// Verificación de email - Rate limited para prevenir fuerza bruta en código
auth_router.post('/verify', auth_limiter, validate(verify_email_schema), verify_email);

// Reenviar código - Rate limited para prevenir spam de emails
auth_router.post('/resend-code', auth_limiter, validate(resend_code_schema), resend_verification_code);

// Login - Rate limited para prevenir fuerza bruta de credenciales
auth_router.post('/login', auth_limiter, validate(login_schema), login);

// Refresh Token - Rate limited para prevenir abuso de rotación de tokens
auth_router.post('/refresh', auth_limiter, validate(refresh_token_schema), refresh);

export default auth_router;