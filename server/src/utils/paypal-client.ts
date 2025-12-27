const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_URL } = process.env;

// ============================================
// 🔐 CACHÉ DE ACCESS TOKEN
// ============================================
// PayPal tokens duran ~9 horas, pero renovamos cada 8 por seguridad
let cached_token: string | null = null;
let token_expiry: number = 0;

export const get_paypal_access_token = async (): Promise<string> => {
    // Retornar token cacheado si aún es válido
    if (cached_token && Date.now() < token_expiry) {
        return cached_token;
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    if (!response.ok) {
        throw new Error('Error obteniendo token de PayPal');
    }

    const data = await response.json() as { access_token: string; expires_in: number };

    // Cachear token (expires_in viene en segundos, restamos 1 hora por seguridad)
    cached_token = data.access_token;
    token_expiry = Date.now() + (data.expires_in - 3600) * 1000;

    return data.access_token;
};

// ============================================
// 🔍 OBTENER DETALLES DE ORDEN
// ============================================
export interface PayPalOrderDetails {
    id: string;
    status: string;
    purchase_units: Array<{
        amount: {
            currency_code: string;
            value: string;
        };
        payments?: {
            captures?: Array<{
                id: string;
                status: string;
                amount: {
                    currency_code: string;
                    value: string;
                };
            }>;
        };
    }>;
}

/**
 * Obtiene los detalles de una orden de PayPal para verificar el monto real.
 * IMPORTANTE: Siempre verificar el monto del servidor, nunca confiar en el cliente.
 */
export const get_paypal_order_details = async (order_id: string): Promise<PayPalOrderDetails | null> => {
    try {
        const access_token = await get_paypal_access_token();

        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${order_id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`[PayPal] Error obteniendo orden ${order_id}: ${response.status}`);
            return null;
        }

        return await response.json() as PayPalOrderDetails;
    } catch (error) {
        console.error('[PayPal] Error en get_paypal_order_details:', error);
        return null;
    }
};

// ============================================
// ✅ VALIDAR MONTO DE CAPTURA
// ============================================
/**
 * Valida que el monto capturado en PayPal coincida con el precio esperado.
 * Retorna true si el monto es válido, false si hay discrepancia.
 */
export const validate_captured_amount = (
    order_details: PayPalOrderDetails,
    expected_amount: number,
    expected_currency: string = 'EUR'
): { is_valid: boolean; captured_amount: number; message: string } => {
    // Verificar que la orden esté completada
    if (order_details.status !== 'COMPLETED') {
        return {
            is_valid: false,
            captured_amount: 0,
            message: `Estado de orden inválido: ${order_details.status}`
        };
    }

    // Obtener el monto capturado
    const captures = order_details.purchase_units?.[0]?.payments?.captures;
    if (!captures || captures.length === 0) {
        return {
            is_valid: false,
            captured_amount: 0,
            message: 'No se encontraron capturas en la orden'
        };
    }

    // Buscar captura completada
    const completed_capture = captures.find(c => c.status === 'COMPLETED');
    if (!completed_capture) {
        return {
            is_valid: false,
            captured_amount: 0,
            message: 'No hay capturas completadas'
        };
    }

    const captured_amount = parseFloat(completed_capture.amount.value);
    const captured_currency = completed_capture.amount.currency_code;

    // Validar moneda
    if (captured_currency !== expected_currency) {
        return {
            is_valid: false,
            captured_amount,
            message: `Moneda incorrecta: esperado ${expected_currency}, recibido ${captured_currency}`
        };
    }

    // Validar monto (permitir diferencia de 0.01 por redondeo)
    const amount_diff = Math.abs(captured_amount - expected_amount);
    if (amount_diff > 0.01) {
        return {
            is_valid: false,
            captured_amount,
            message: `Monto incorrecto: esperado ${expected_amount}, recibido ${captured_amount}`
        };
    }

    return {
        is_valid: true,
        captured_amount,
        message: 'Validación exitosa'
    };
};