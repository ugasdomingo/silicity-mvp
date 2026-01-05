// ============================================
// 💳 MÉTODOS DE PAGO OFFLINE - CONFIGURACIÓN
// ============================================
// Edita este archivo para agregar o quitar métodos de pago offline.
// Los cambios se reflejan automáticamente en la vista de pago.

export interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    instructions: string;   // Instrucciones para el usuario
    details: {
        label: string;
        value: string;
        copyable?: boolean; // Si el usuario puede copiar el valor
    }[];
    enabled: boolean;       // Para activar/desactivar sin borrar
}

export const OFFLINE_PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: 'usdt_bep20',
        name: 'USDT (BEP20)',
        icon: '🔶',
        instructions: 'Envía el monto exacto a la siguiente dirección en la red BSC.',
        details: [
            {
                label: 'Red',
                value: 'BEP20 (Binance Smart Chain)',
                copyable: false
            },
            {
                label: 'Dirección',
                value: '0xa912c0d4c9d0a96bc4a7388e15af211b9bf64f21',
                copyable: true
            }
        ],
        enabled: true
    },
    {
        id: 'zelle',
        name: 'Zelle',
        icon: '🏦',
        instructions: 'Envía el pago a través de Zelle y anota el número de confirmación.',
        details: [
            {
                label: 'Email Zelle',
                value: 'pagos@silicity.com', // Reemplaza con tu email real
                copyable: true
            },
            {
                label: 'Titular',
                value: 'Silicity LLC',
                copyable: false
            }
        ],
        enabled: false
    },
    {
        id: 'bank_eu',
        name: 'Transferencia en Europa',
        icon: '🏛️',
        instructions: 'Realiza una transferencia bancaria en Europa.',
        details: [
            {
                label: 'Banco',
                value: 'Wise',
                copyable: false
            },
            {
                label: 'IBAN',
                value: 'BE12 9674 9041 5592',
                copyable: true
            },
            {
                label: 'Titular',
                value: 'Domingo Ugas - (Autorizado)',
                copyable: false
            }
        ],
        enabled: true
    },
    {
        id: 'bank_ve_bbva',
        name: 'Transferencia en Venezuela',
        icon: '🏛️',
        instructions: 'Realiza una transferencia bancaria en Europa.',
        details: [
            {
                label: 'Banco',
                value: 'Provincial',
                copyable: false
            },
            {
                label: 'IBAN',
                value: 'BE12 9674 9041 5592',
                copyable: true
            },
            {
                label: 'Titular',
                value: 'Domingo Ugas - (Autorizado)',
                copyable: false
            }
        ],
        enabled: false
    },
    {
        id: 'pago_movil_ve',
        name: 'Venezuela - Pago Móvil',
        icon: '🏛️',
        instructions: 'Realiza una pago móvil en Venezuela.',
        details: [
            {
                label: 'Banco',
                value: 'Provincial',
                copyable: false
            },
            {
                label: 'Cédula de Identidad',
                value: 'V-19.066.267',
                copyable: true
            },
            {
                label: 'Teléfono',
                value: '+58 414 260 44 96',
                copyable: true
            }
        ],
        enabled: true
    }
];

// ============================================
// 💰 PRECIOS POR PLAN
// ============================================
// Sincronizado con el backend (payment-controller.ts)
export type PlanKey = 'student_quarterly' | 'student_yearly' | 'talent_quarterly' | 'talent_yearly';
export type BasePlan = 'student' | 'talent';
export type Period = 'quarterly' | 'yearly';

export interface PlanPrice {
    amount: number;
    currency: string;
    label: string;
    period: Period;
    base_plan: BasePlan;
}

export const PLAN_PRICES: Record<PlanKey, PlanPrice> = {
    student_quarterly: {
        amount: 15,
        currency: 'USD',
        label: 'Student Trimestral',
        period: 'quarterly',
        base_plan: 'student'
    },
    student_yearly: {
        amount: 50,
        currency: 'USD',
        label: 'Student Anual',
        period: 'yearly',
        base_plan: 'student'
    },
    talent_quarterly: {
        amount: 30,
        currency: 'USD',
        label: 'Talent Trimestral',
        period: 'quarterly',
        base_plan: 'talent'
    },
    talent_yearly: {
        amount: 100,
        currency: 'USD',
        label: 'Talent Anual',
        period: 'yearly',
        base_plan: 'talent'
    }
};

// Precios agrupados por plan base (para el frontend)
export const PRICES_BY_PLAN: Record<BasePlan, { quarterly: number; yearly: number }> = {
    student: {
        quarterly: PLAN_PRICES.student_quarterly.amount,
        yearly: PLAN_PRICES.student_yearly.amount
    },
    talent: {
        quarterly: PLAN_PRICES.talent_quarterly.amount,
        yearly: PLAN_PRICES.talent_yearly.amount
    }
};

// ============================================
// 🔧 HELPERS
// ============================================

/**
 * Obtiene solo los métodos de pago activos
 */
export const getActivePaymentMethods = (): PaymentMethod[] => {
    return OFFLINE_PAYMENT_METHODS.filter(method => method.enabled);
};

/**
 * Obtiene un método de pago por su ID
 */
export const getPaymentMethodById = (id: string): PaymentMethod | undefined => {
    return OFFLINE_PAYMENT_METHODS.find(method => method.id === id);
};

/**
 * Obtiene el precio de un plan
 */
export const getPlanPrice = (planKey: PlanKey): PlanPrice | undefined => {
    return PLAN_PRICES[planKey];
};

/**
 * Valida si un plan key es válido
 */
export const isValidPlanKey = (key: string): key is PlanKey => {
    return key in PLAN_PRICES;
};