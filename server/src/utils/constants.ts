// ============================================
// 📋 CONSTANTES CENTRALIZADAS - SILICITY
// ============================================
// Única fuente de verdad para evitar strings hardcodeados

// ============================================
// 👤 ROLES DE USUARIO
// ============================================
export const USER_ROLES = {
    USER: 'user',           // Freemium (solo ve info pública)
    STUDENT: 'student',     // Estudiante con membresía
    TALENT: 'talent',       // Talento premium (vitrina)
    COMPANY: 'company',     // Empresa buscando talento
    VC: 'vc',               // Venture Capital
    ADMIN: 'Admin',         // Administrador
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Roles que requieren pago
export const PAID_ROLES: UserRole[] = [USER_ROLES.STUDENT, USER_ROLES.TALENT];

// Roles empresariales (early adopters con trial gratis)
export const BUSINESS_ROLES: UserRole[] = [USER_ROLES.COMPANY, USER_ROLES.VC];

// Roles que pueden publicar proyectos
export const PROJECT_PUBLISHER_ROLES: UserRole[] = [USER_ROLES.COMPANY, USER_ROLES.VC];

// Roles que pueden postularse a proyectos
export const PROJECT_APPLICANT_ROLES: UserRole[] = [USER_ROLES.TALENT];

// ============================================
// 📊 ESTADOS DE CUENTA
// ============================================
export const ACCOUNT_STATUS = {
    ACTIVE: 'active',
    PENDING_APPROVAL: 'pending_approval',
    SUSPENDED: 'suspended',
} as const;

export type AccountStatus = typeof ACCOUNT_STATUS[keyof typeof ACCOUNT_STATUS];

// ============================================
// 💳 ESTADOS DE PAGO
// ============================================
export const PAYMENT_STATUS = {
    UNPAID: 'unpaid',           // No ha pagado
    PENDING: 'pending',         // Pago reportado, esperando validación
    ACTIVE: 'active',           // Membresía activa
    FREE_TRIAL: 'free_trial',   // Trial gratis (empresas early adopter)
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// ============================================
// 💰 PRECIOS DE PLANES (EUR)
// ============================================
export const PLAN_PRICES = {
    student: 15.00,
    talent: 30.00,
} as const;

export type PlanType = keyof typeof PLAN_PRICES;

// ============================================
// 📝 ESTADOS DE APLICACIONES
// ============================================
export const APPLICATION_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ASSIGNED: 'assigned',   // Para proyectos
} as const;

export type ApplicationStatus = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];

// ============================================
// 🎯 ESTADOS DE PROYECTOS
// ============================================
export const PROJECT_STATUS = {
    PENDING_REVIEW: 'pending_review',
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELED: 'canceled',
} as const;

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];

// ============================================
// 🧠 ESTADOS DE EVALUACIÓN PSICOLÓGICA
// ============================================
export const PSYCH_EVAL_STATUS = {
    NOT_REQUIRED: 'not_required',
    PENDING_PAYMENT: 'pending_payment',
    SCHEDULED: 'scheduled',
    PASSED: 'passed',
    FAILED: 'failed',
} as const;

export type PsychEvalStatus = typeof PSYCH_EVAL_STATUS[keyof typeof PSYCH_EVAL_STATUS];

// ============================================
// 📅 ESTADOS DE CITAS
// ============================================
export const APPOINTMENT_STATUS = {
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    RESCHEDULED: 'rescheduled',
} as const;

export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

// ============================================
// 👥 ESTADOS DE GRUPOS DE ESTUDIO
// ============================================
export const GROUP_STATUS = {
    OPEN: 'open',
    CLOSED: 'closed',
} as const;

export const GROUP_VISIBILITY = {
    PUBLIC: 'public',
    HIDDEN: 'hidden',
} as const;

// ============================================
// ⏱️ CONSTANTES DE TIEMPO
// ============================================
export const TIME_CONSTANTS = {
    VERIFICATION_CODE_EXPIRY_MINUTES: 15,
    MAX_VERIFICATION_ATTEMPTS: 5,
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '30d',
    PROJECT_COOLDOWN_MONTHS: 3,  // Empresas solo pueden publicar cada 3 meses
} as const;

// ============================================
// 📧 CONFIGURACIÓN DE EMAILS
// ============================================
export const EMAIL_SUBJECTS = {
    VERIFICATION: '🔐 ¡Bienvenido a Silicity! Confirma tu email',
    PASSWORD_RESET: '🔑 Restablecer contraseña - Silicity',
    WELCOME: '🎉 ¡Bienvenido a Silicity!',
    PROJECT_APPROVED: '🚀 Tu proyecto ha sido aprobado',
    APPLICATION_RECEIVED: '📬 Nueva postulación recibida',
} as const;

// ============================================
// 🔢 LÍMITES
// ============================================
export const LIMITS = {
    MAX_MESSAGE_LENGTH: 2000,
    MIN_MESSAGE_LENGTH: 1,
    MAX_BIO_LENGTH: 500,
    MAX_HEADLINE_LENGTH: 100,
    MAX_SKILLS: 20,
    MAX_FILE_SIZE_KB: 10,
} as const;