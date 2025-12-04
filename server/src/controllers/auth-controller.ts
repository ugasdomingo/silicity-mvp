import { Request, Response, NextFunction } from 'express';
import User from '../models/User-model';
import Invitation from '../models/Invitation-model';
import { AppError } from '../utils/app-error';
import { send_response } from '../utils/response-handler';
import { generate_six_digits_code } from '../utils/code-generator';
import { send_verification_email } from '../utils/mailer';
import { get_login_user_data } from '../services/auth-service'; // Servicio refactorizado
import jwt from 'jsonwebtoken';

// @desc    Registrar usuario y enviar código
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
        let company_info = {};

        // 2. Asignación de Roles y Beneficios

        // A) EMPRESAS y VCs (Early Adopters) -> Entran directo con Año Gratis
        if (role && ['company', 'vc'].includes(role)) {
            final_role = role;
            payment_status = 'free_trial'; // ¡Acceso total inmediato!

            company_info = {
                description: '',
                website: website
            }
        }

        // B) ESTUDIANTES y TALENTO -> Requieren pago posterior
        else if (role && ['student', 'talent'].includes(role)) {
            final_role = role;
            payment_status = 'unpaid';
        }

        // C) CURIOSOS (Default) -> Rol 'user', status 'active' (Freemium)

        // Seguridad: Bloquear intento de registro Admin
        if (role === 'Admin') return next(new AppError('No permitido', 403));

        const verification_code = generate_six_digits_code();

        await User.create({
            name,
            email,
            password,
            role: final_role,
            payment_status,
            verification_code,
            is_verified: false,
            terms_and_privacy_accepted,
            company_info,
        });

        await send_verification_email(email, verification_code);

        send_response(res, 201, 'Cuenta creada. Te enviamos un enlace de verificación a tu correo.');
    } catch (error) {
        next(error);
    }
};

// @desc    Verificar email con código
// @route   POST /api/auth/verify
export const verify_email = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // El frontend lee la URL y nos manda un JSON body: { email, code }
        const { email, code } = req.body;

        if (!email || !code) {
            return next(new AppError('Faltan datos de verificación', 400));
        }

        const user = await User.findOne({ email }).select('+verification_code');

        if (!user) {
            return next(new AppError('Usuario no encontrado', 404));
        }

        if (user.is_verified) {
            return send_response(res, 200, 'El usuario ya estaba verificado', {
                user_id: user._id,
                role: user.role
            });
        }

        if (user.verification_code !== code) {
            return next(new AppError('Código de verificación inválido', 400));
        }

        // Código correcto: Verificamos
        user.is_verified = true;
        user.verification_code = '';
        await user.save();

        // Generamos token para que entre directo (Auto-Login)
        const response_data = await get_login_user_data(user);

        send_response(res, 200, 'Cuenta verificada exitosamente', response_data);

    } catch (error) {
        next(error);
    }
};

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

        // El servicio se encarga de todo
        const response_data = await get_login_user_data(user);

        send_response(res, 200, 'Bienvenido(a) de vuelta', response_data);
    } catch (error) {
        next(error);
    }
};

// @desc    Refrescar token
// @route   POST /api/auth/refresh
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return next(new AppError('Token no proporcionado', 401));
        }

        const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET as string) as any;

        const user = await User.findById(decoded.user_id);
        if (!user) {
            return next(new AppError('Usuario no encontrado', 401));
        }

        // Al llamar al servicio, generamos NUEVOS tokens automáticamente (rotación)
        const response_data = await get_login_user_data(user);

        send_response(res, 200, 'OK', response_data);
    } catch (error) {
        return next(new AppError('Token de refresco inválido o expirado', 401));
    }
};