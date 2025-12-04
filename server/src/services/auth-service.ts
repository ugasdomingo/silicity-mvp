import { IUser } from '../models/User-model';
import { generate_access_token, generate_refresh_token } from '../utils/auth-utils';

/**
 * Construye el objeto estandarizado de usuario para enviar al cliente.
 * Centraliza la lógica de qué datos se exponen.
 */
export const get_login_user_data = async (user: IUser) => {
    // NOTA: En el futuro, aquí haremos las consultas a las otras colecciones
    // Ejemplo: const scholarships = await Scholarship.find({ user: user._id, status: 'approved' });

    // Lógica para 'is_talent_visible' (job_)
    // Solo visible si es role 'talent' (o premium) y cumple requisitos (que validaremos más adelante)
    const is_talent_visible = ['talent'].includes(user.role);

    // Generar tokens
    const access_token = generate_access_token(user._id as any);
    const refresh_token = generate_refresh_token(user._id as any);

    return {
        user_data: {
            name: user.name,
            email: user.email,
            role: user.role,
            is_verified: user.is_verified,

            // Datos extendidos (Placeholders por ahora)
            scholarships: [],       // Becas aprobadas
            study_groups: [],       // Grupos inscritos
            projects: [],           // Proyectos participando
            investment_ideas: [],   // Emprendimientos (VCs)
            is_talent_visible,      // Vitrina de talento (job_)
        },
        access_token,
        refresh_token
    };
};