import { Request, Response, NextFunction } from 'express';
import User from '../models/User-model';
import Invitation from '../models/Invitation-model';
import { AppError } from '../utils/app-error';
import { send_response } from '../utils/response-handler';
import { generate_six_digits_code } from '../utils/code-generator';
import { send_email } from '../utils/mailer';
import { get_login_user_data } from '../services/auth-service';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// ============================================
// 🔐 CONSTANTES DE SEGURIDAD
// ============================================
const VERIFICATION_CODE_EXPIRY_MINUTES = 15; // Código válido por 15 minutos
const PASSWORD_RESET_EXPIRY_MINUTES = 60; // Reset válido por 60 minutos
const MAX_VERIFICATION_ATTEMPTS = 5;         // Máximo intentos antes de bloquear

// ============================================
// 1️⃣ REGISTRO
// ============================================
// @desc    Registrar usuario y enviar código de verificación
// @route   POST /api/auth/register
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, role, website, terms_and_privacy_accepted } = req.body;

        // 1. Verificar existencia
        const user_exists = await User.findOne({ email });
        if (user_exists) {
            return next(new AppError('El correo electrónico ya está registrado', 400));
        }

        let final_role = 'user';
        let payment_status = 'active'; // Default para Free User
        let account_status = 'active';
        let company_info = {};

        // 2. Asignación de Roles y Beneficios

        // A) EMPRESAS y VCs (Early Adopters) -> Entran directo con Año Gratis
        if (role && ['company', 'vc'].includes(role)) {
            final_role = role;
            payment_status = 'free_trial';
            account_status = 'pending_approval';

            company_info = {
                description: '',
                website: website
            };
        }

        // B) ESTUDIANTES y TALENTO -> Requieren pago posterior
        else if (role && ['student', 'talent'].includes(role)) {
            final_role = role;
            payment_status = 'unpaid';
        }

        // C) CURIOSOS (Default) -> Rol 'user', status 'active' (Freemium)

        // 🔐 Seguridad: Bloquear intento de registro como Admin
        if (role === 'Admin') {
            return next(new AppError('No permitido', 403));
        }

        // Generar código y fecha de expiración
        const verification_code = generate_six_digits_code();
        const verification_code_expires = new Date(
            Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000
        );

        await User.create({
            name,
            email,
            password,
            role: final_role,
            payment_status,
            account_status,
            verification_code,
            verification_code_expires, // 🆕 Nuevo campo
            is_verified: false,
            terms_and_privacy_accepted,
            company_info,
        });

        // Enviar email de verificación
        const verification_url = `${process.env.CLIENT_URL}/auth/verify?email=${encodeURIComponent(email)}&code=${verification_code}`;

        await send_email(
            email,
            '🔐 ¡Bienvenido a Silicity! Confirma tu email',
            'verification-email',
            {
                user_name: name,
                verification_url
            }
        );

        // Notificar admin si es empresa pendiente
        if (account_status === 'pending_approval') {
            await send_email(
                process.env.ADMIN_EMAIL as string,
                `🏢 Nueva Empresa Registrada: ${name}`,
                'admin-alert',
                {
                    alert_title: 'Solicitud de Empresa Pendiente',
                    message_body: `La empresa ${name} se ha registrado y requiere aprobación manual.`,
                    details: [
                        { key: 'Email', value: email },
                        { key: 'Web', value: website || 'N/A' },
                        { key: 'Rol', value: final_role }
                    ],
                    action_url: `${process.env.CLIENT_URL}/dashboard/admin/users`,
                    action_text: 'Revisar Solicitud'
                }
            );
        }

        const message = account_status === 'pending_approval'
            ? 'Registro exitoso. Tu cuenta de empresa está en revisión. Te notificaremos cuando sea aprobada.'
            : 'Te enviamos un enlace de verificación a tu correo.';

        send_response(res, 201, message);
    } catch (error) {
        next(error);
    }
};

// ============================================
// 2️⃣ VERIFICAR EMAIL
// ============================================
// @desc    Verificar email con código (válido por 15 min)
// @route   POST /api/auth/verify
export const verify_email = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return next(new AppError('Faltan datos de verificación', 400));
        }

        // Obtener usuario con campos ocultos necesarios
        const user = await User.findOne({ email }).select(
            '+verification_code +verification_code_expires +verification_attempts'
        );

        if (!user) {
            return next(new AppError('Usuario no encontrado', 404));
        }

        // Ya verificado
        if (user.is_verified) {
            return send_response(res, 200, 'El usuario ya estaba verificado', {
                user_id: user._id,
                role: user.role
            });
        }

        // ============================
        // 🔐 VALIDACIONES DE SEGURIDAD
        // ============================

        // 1. Verificar intentos máximos (anti fuerza bruta)
        const attempts = (user as any).verification_attempts || 0;
        if (attempts >= MAX_VERIFICATION_ATTEMPTS) {
            return next(new AppError(
                'Demasiados intentos fallidos. Solicita un nuevo código de verificación.',
                429
            ));
        }

        // 2. Verificar expiración del código
        const expires = (user as any).verification_code_expires;
        if (expires && new Date() > new Date(expires)) {
            return next(new AppError(
                'El código de verificación ha expirado. Solicita uno nuevo.',
                400
            ));
        }

        // 3. Verificar código correcto
        if (user.verification_code !== code) {
            // Incrementar intentos fallidos
            await User.findByIdAndUpdate(user._id, {
                $inc: { verification_attempts: 1 }
            });

            const remaining = MAX_VERIFICATION_ATTEMPTS - attempts - 1;
            return next(new AppError(
                `Código inválido. Te quedan ${remaining} intento(s).`,
                400
            ));
        }

        // ============================
        // ✅ CÓDIGO CORRECTO
        // ============================
        user.is_verified = true;
        user.verification_code = '';
        (user as any).verification_code_expires = undefined;
        (user as any).verification_attempts = 0;
        await user.save();

        // 🔔 Notificar Admin: Nuevo Usuario Verificado
        const admin_email = process.env.SMTP_USER as string;
        await send_email(
            admin_email,
            `👤 Nuevo Usuario Verificado: ${user.name}`,
            'admin-alert',
            {
                alert_title: 'Nuevo Usuario en Silicity',
                message_body: 'Un nuevo usuario ha completado el proceso de verificación.',
                details: [
                    { key: 'Nombre', value: user.name },
                    { key: 'Email', value: user.email },
                    { key: 'Rol', value: user.role },
                    { key: 'ID', value: user._id }
                ],
                action_url: `${process.env.CLIENT_URL}/app/dashboard/admin/users`,
                action_text: 'Ver Usuarios'
            }
        );

        // Si es empresa pendiente, no auto-login
        if (user.account_status === 'pending_approval') {
            return send_response(res, 200, 'Correo verificado. Tu cuenta espera aprobación del administrador.');
        }

        // Auto-Login con tokens
        const response_data = await get_login_user_data(user);

        send_response(res, 200, 'Cuenta verificada exitosamente', response_data);

    } catch (error) {
        next(error);
    }
};

// ============================================
// 3️⃣ REENVIAR CÓDIGO DE VERIFICACIÓN
// ============================================
// @desc    Reenviar código si expiró o se perdió
// @route   POST /api/auth/resend-code
export const resend_verification_code = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(new AppError('Email requerido', 400));
        }

        const user = await User.findOne({ email });

        if (!user) {
            // No revelar si el email existe o no (seguridad)
            return send_response(res, 200, 'Si el email existe, recibirás un nuevo código.');
        }

        if (user.is_verified) {
            return next(new AppError('Esta cuenta ya está verificada', 400));
        }

        // Generar nuevo código
        const verification_code = generate_six_digits_code();
        const verification_code_expires = new Date(
            Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000
        );

        // Resetear intentos y actualizar código
        user.verification_code = verification_code;
        (user as any).verification_code_expires = verification_code_expires;
        (user as any).verification_attempts = 0;
        await user.save();

        // Enviar email
        const verification_url = `${process.env.CLIENT_URL}/auth/verify?email=${encodeURIComponent(email)}&code=${verification_code}`;

        await send_email(
            email,
            '🔐 Nuevo código de verificación - Silicity',
            'verification-email',
            {
                user_name: user.name,
                verification_url
            }
        );

        send_response(res, 200, 'Nuevo código enviado a tu correo.');
    } catch (error) {
        next(error);
    }
};

// ============================================
// 4️⃣ LOGIN
// ============================================
// @desc    Iniciar sesión
// @route   POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError('Por favor ingrese email y contraseña', 400));
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.match_password(password))) {
            return next(new AppError('Credenciales incorrectas', 401));
        }

        if (!user.is_verified) {
            return next(new AppError('Debes verificar tu correo electrónico antes de iniciar sesión', 401));
        }

        // 🔒 Bloqueo de cuentas
        if (user.account_status === 'pending_approval') {
            return next(new AppError('Tu cuenta de empresa está en revisión. Te avisaremos al aprobarla.', 403));
        }
        if (user.account_status === 'suspended') {
            return next(new AppError('Tu cuenta ha sido suspendida. Contacta a soporte.', 403));
        }

        const response_data = await get_login_user_data(user);

        send_response(res, 200, 'Bienvenido(a) de vuelta', response_data);
    } catch (error) {
        next(error);
    }
};

// ============================================
// 5️⃣ REFRESH TOKEN
// ============================================
// @desc    Refrescar access token
// @route   POST /api/auth/refresh
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return next(new AppError('Token no proporcionado', 401));
        }

        // Verificar y decodificar token
        let decoded: any;
        try {
            decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET as string);
        } catch (err) {
            return next(new AppError('Token de refresco inválido o expirado', 401));
        }

        const user = await User.findById(decoded.user_id);

        if (!user) {
            return next(new AppError('Usuario no encontrado', 401));
        }

        // Verificar estado de cuenta
        if (user.account_status === 'suspended') {
            return next(new AppError('Cuenta suspendida. Contacta a soporte.', 401));
        }

        if (user.account_status === 'pending_approval') {
            return next(new AppError('Tu cuenta está en revisión.', 401));
        }

        const response_data = await get_login_user_data(user);

        send_response(res, 200, 'OK', response_data);
    } catch (error) {
        next(error);
    }
};

// ============================================
// 6️⃣ RECUPERAR CONTRASEÑA
// ============================================
// @desc    Solicitar recuperación de contraseña
// @route   POST /api/auth/forgot-password
export const forgot_password = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        // Por seguridad, siempre respondemos igual (no revelamos si el email existe)
        if (!user) {
            return send_response(res, 200, 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.');
        }

        // Verificar que la cuenta esté activa
        if (user.account_status === 'suspended') {
            return send_response(res, 200, 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.');
        }

        // Generar token único
        const reset_token = crypto.randomBytes(32).toString('hex');

        // Hash del token para guardar en DB (más seguro)
        const hashed_token = crypto
            .createHash('sha256')
            .update(reset_token)
            .digest('hex');

        // Guardar en usuario
        user.password_reset_token = hashed_token;
        user.password_reset_expires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        // Crear URL de reset
        const reset_url = `${process.env.CLIENT_URL}/auth/reset-password?token=${reset_token}&email=${encodeURIComponent(email)}`;

        // Enviar email
        try {
            await send_email(
                user.email,
                '🔑 Restablecer tu contraseña - Silicity',
                'reset-password',
                {
                    user_name: user.name,
                    reset_url,
                    expiry_minutes: PASSWORD_RESET_EXPIRY_MINUTES
                }
            );

            send_response(res, 200, 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.');
        } catch (email_error) {
            // Si falla el email, limpiamos los campos
            user.password_reset_token = undefined;
            user.password_reset_expires = undefined;
            await user.save({ validateBeforeSave: false });

            console.error('[Auth] Error enviando email de reset:', email_error);
            return next(new AppError('Error enviando el email. Por favor intenta más tarde.', 500));
        }

    } catch (error) {
        next(error);
    }
};

// @desc    Restablecer contraseña con token
// @route   POST /api/auth/reset-password
export const reset_password = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, email, password } = req.body;

        if (!token || !email || !password) {
            return next(new AppError('Datos incompletos', 400));
        }

        // Hash del token recibido para comparar
        const hashed_token = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Buscar usuario con token válido y no expirado
        const user = await User.findOne({
            email,
            password_reset_token: hashed_token,
            password_reset_expires: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            return next(new AppError('Token inválido o expirado. Solicita un nuevo enlace.', 400));
        }

        // Validar que la nueva contraseña sea diferente
        const is_same_password = await user.match_password(password);
        if (is_same_password) {
            return next(new AppError('La nueva contraseña debe ser diferente a la actual', 400));
        }

        // Actualizar contraseña
        user.password = password;
        user.password_reset_token = undefined;
        user.password_reset_expires = undefined;
        await user.save();

        // Notificar al usuario
        await send_email(
            user.email,
            '✅ Contraseña actualizada - Silicity',
            'admin-alert',
            {
                alert_title: 'Contraseña Actualizada',
                message_body: `Hola ${user.name}, tu contraseña ha sido cambiada exitosamente. Si no realizaste este cambio, contacta a soporte inmediatamente.`,
                details: [
                    { key: 'Fecha', value: new Date().toLocaleDateString('es-ES') },
                    { key: 'Hora', value: new Date().toLocaleTimeString('es-ES') }
                ],
                action_url: `${process.env.CLIENT_URL}/auth/login`,
                action_text: 'Iniciar Sesión'
            }
        );

        send_response(res, 200, 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.');

    } catch (error) {
        next(error);
    }
};