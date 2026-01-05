<template>
    <div class="payment-container">
        <div class="payment-card">
            <!-- Header con info del plan -->
            <div class="plan-header">
                <div class="plan-icon">{{ user_plan === 'student' ? '🎓' : '⭐' }}</div>
                <div class="plan-details">
                    <h2>Membresía {{ user_plan === 'student' ? 'Student' : 'Talent' }}</h2>
                </div>
            </div>

            <p class="subtitle">Completa tu pago para activar todos los beneficios</p>

            <div class="divider"></div>

            <!-- Selector de período -->
            <h3>Período de Facturación</h3>
            <div class="period-selector">
                <button :class="['period-btn', { active: selected_period === 'quarterly' }]"
                    @click="selected_period = 'quarterly'">
                    <span class="period-label">Trimestral</span>
                    <span class="period-price">${{ prices.quarterly }}/3 meses</span>
                </button>
                <button :class="['period-btn', { active: selected_period === 'yearly' }]"
                    @click="selected_period = 'yearly'">
                    <span class="period-label">Anual</span>
                    <span class="period-price">${{ prices.yearly }}/año</span>
                    <span class="period-badge">Ahorra {{ savings_percent }}%</span>
                </button>
            </div>

            <!-- Precio seleccionado -->
            <div class="selected-price">
                <span class="total-label">Total a pagar:</span>
                <span class="total-amount">${{ current_price }} USD</span>
            </div>

            <div class="divider"></div>

            <!-- Selector de método -->
            <h3>Método de Pago</h3>
            <div class="payment-methods">
                <button :class="['method-btn', { active: selected_method === 'paypal' }]"
                    @click="selected_method = 'paypal'">
                    <span class="method-icon">🅿️</span>
                    <span>PayPal / Tarjeta</span>
                </button>
                <button :class="['method-btn', { active: selected_method === 'offline' }]"
                    @click="selected_method = 'offline'">
                    <span class="method-icon">💵</span>
                    <span>Pago Offline</span>
                </button>
            </div>

            <!-- PayPal -->
            <div v-if="selected_method === 'paypal'" class="paypal-section">
                <p class="method-desc">Pago seguro con tarjeta o cuenta PayPal</p>
                <div id="paypal-button-container" ref="paypal_container"></div>
                <p v-if="paypal_loading" class="loading-text">Cargando PayPal...</p>
            </div>

            <!-- Offline -->
            <div v-if="selected_method === 'offline'" class="offline-section">
                <!-- Selector de método offline -->
                <div class="offline-methods">
                    <button v-for="method in active_offline_methods" :key="method.id"
                        :class="['offline-method-btn', { active: selected_offline_method === method.id }]"
                        @click="selected_offline_method = method.id">
                        <span class="icon">{{ method.icon }}</span>
                        <span>{{ method.name }}</span>
                    </button>
                </div>

                <!-- Detalles del método seleccionado -->
                <div v-if="current_offline_method" class="method-details">
                    <p class="instructions">{{ current_offline_method.instructions }}</p>

                    <div class="details-list">
                        <div v-for="detail in current_offline_method.details" :key="detail.label" class="detail-item">
                            <span class="detail-label">{{ detail.label }}:</span>
                            <div class="detail-value-wrapper">
                                <code class="detail-value">{{ detail.value }}</code>
                                <button v-if="detail.copyable" class="copy-btn" @click="copy_to_clipboard(detail.value)"
                                    :title="'Copiar ' + detail.label">
                                    <Copy :size="14" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="amount-reminder">
                        <strong>Monto a enviar:</strong> ${{ current_price }} USD
                    </div>

                    <div class="reference-input">
                        <label for="reference">Número de Referencia / Hash de Transacción</label>
                        <input id="reference" v-model="offline_reference" type="text"
                            placeholder="Ej: 0x1234... o #12345678" :disabled="is_loading" />
                    </div>

                    <button class="submit-btn" @click="handle_offline_submit"
                        :disabled="!offline_reference.trim() || is_loading">
                        <span v-if="is_loading">Enviando...</span>
                        <span v-else>Reportar Pago</span>
                    </button>
                </div>

                <div v-else class="select-method-hint">
                    <p>👆 Selecciona un método de pago para ver los detalles</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { loadScript, type PayPalNamespace } from '@paypal/paypal-js';
import { Copy } from 'lucide-vue-next';
import api_client from '../../api/axios-client';
import { use_auth_store } from '../../stores/auth-store';
import { use_ui_store } from '../../stores/ui-store';
import {
    getActivePaymentMethods,
    getPaymentMethodById,
    type PaymentMethod
} from '../../static/payment-methods';

const router = useRouter();
const auth_store = use_auth_store();
const ui_store = use_ui_store();
const paypal_container = ref<HTMLElement | null>(null);

// ============================================
// 💰 PRECIOS
// ============================================
const PLAN_PRICES = {
    student: {
        quarterly: 15,
        yearly: 50
    },
    talent: {
        quarterly: 30,
        yearly: 100
    }
};

// ============================================
// 📊 STATE
// ============================================
const selected_period = ref<'quarterly' | 'yearly'>('quarterly');
const selected_method = ref<'paypal' | 'offline'>('paypal');
const selected_offline_method = ref<string>('');
const offline_reference = ref('');
const is_loading = ref(false);
const paypal_loading = ref(true);

let paypal_buttons_instance: any = null;

// ============================================
// 🔢 COMPUTED
// ============================================
const user_plan = computed((): 'student' | 'talent' => {
    const role = auth_store.user?.role;
    return (role === 'student' || role === 'talent') ? role : 'student';
});

const prices = computed(() => PLAN_PRICES[user_plan.value]);

const current_price = computed(() => prices.value[selected_period.value]);

const savings_percent = computed(() => {
    const quarterly_annual = prices.value.quarterly * 4;
    const yearly = prices.value.yearly;
    return Math.round((1 - yearly / quarterly_annual) * 100);
});

const active_offline_methods = computed((): PaymentMethod[] => {
    return getActivePaymentMethods();
});

const current_offline_method = computed((): PaymentMethod | undefined => {
    return getPaymentMethodById(selected_offline_method.value);
});

// Plan key para el backend (ej: 'student_quarterly', 'talent_yearly')
const plan_key = computed(() => `${user_plan.value}_${selected_period.value}`);

// ============================================
// 👀 WATCHERS
// ============================================

// Auto-select first offline method
watch(selected_method, (newMethod) => {
    if (newMethod === 'offline' && !selected_offline_method.value) {
        const first_method = active_offline_methods.value[0];
        if (first_method) {
            selected_offline_method.value = first_method.id;
        }
    }
});

// Re-render PayPal buttons when period changes
watch(selected_period, () => {
    if (selected_method.value === 'paypal') {
        render_paypal_buttons();
    }
});

// ============================================
// 🔧 HELPERS
// ============================================
const copy_to_clipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        ui_store.show_toast('Copiado al portapapeles', 'success');
    } catch (err) {
        ui_store.show_toast('Error al copiar', 'error');
    }
};

// ============================================
// 🅿️ PAYPAL
// ============================================
let paypal_sdk: PayPalNamespace | null = null;

const render_paypal_buttons = async () => {
    // Limpiar botones anteriores
    if (paypal_buttons_instance) {
        try {
            await paypal_buttons_instance.close();
        } catch (e) {
            // Ignorar error si ya estaba cerrado
        }
        paypal_buttons_instance = null;
    }

    const container = document.getElementById('paypal-button-container');
    if (container) {
        container.innerHTML = '';
    }

    if (!paypal_sdk || !paypal_sdk.Buttons) {
        return;
    }

    try {
        paypal_buttons_instance = paypal_sdk.Buttons({
            style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'pay'
            },
            createOrder: async () => {
                try {
                    const { data } = await api_client.post('/api/payments/paypal/create-order', {
                        plan: plan_key.value
                    });
                    return data.data.order_id;
                } catch (error) {
                    ui_store.show_toast('Error al crear orden de PayPal', 'error');
                    throw error;
                }
            },
            onApprove: async (data: any) => {
                try {
                    const response = await api_client.post('/api/payments/paypal/capture-order', {
                        order_id: data.orderID
                    });

                    // Actualizar sesión con nuevos datos
                    if (response.data.data) {
                        auth_store.set_session(response.data.data);
                    }

                    ui_store.show_toast('¡Pago exitoso! Membresía activada', 'success');
                    router.push({ name: 'dashboard' });
                } catch (error) {
                    ui_store.show_toast('Error al procesar el pago', 'error');
                }
            },
            onError: (err: any) => {
                console.error('[PayPal] Error:', err);
                ui_store.show_toast('Error en PayPal. Intenta de nuevo.', 'error');
            },
            onCancel: () => {
                ui_store.show_toast('Pago cancelado', 'error');
            }
        });

        await paypal_buttons_instance.render('#paypal-button-container');
    } catch (error) {
        console.error('[PayPal] Error renderizando botones:', error);
    }
};

const setup_paypal = async () => {
    paypal_loading.value = true;
    console.log(import.meta.env)

    try {
        paypal_sdk = await loadScript({
            clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
            currency: 'USD'
        });

        if (!paypal_sdk || !paypal_sdk.Buttons) {
            throw new Error('PayPal SDK no cargó correctamente');
        }

        await render_paypal_buttons();

    } catch (error) {
        console.error('[PayPal] Error cargando SDK:', error);
        ui_store.show_toast('Error cargando PayPal', 'error');
    } finally {
        paypal_loading.value = false;
    }
};

// ============================================
// 💵 OFFLINE
// ============================================
const handle_offline_submit = async () => {
    if (!offline_reference.value.trim()) {
        ui_store.show_toast('Ingresa la referencia del pago', 'error');
        return;
    }

    is_loading.value = true;

    try {
        await api_client.post('/api/payments/offline', {
            reference: offline_reference.value.trim(),
            plan: plan_key.value
        });

        ui_store.show_toast('Pago reportado. Esperando validación del administrador.', 'success');
        router.push({ name: 'dashboard' });
    } catch (error) {
        console.error('[Payment] Error reportando pago offline:', error);
    } finally {
        is_loading.value = false;
    }
};

// ============================================
// 🚀 INIT
// ============================================
onMounted(() => {
    // Verificar que el usuario necesita pagar
    if (auth_store.user?.payment_status === 'active') {
        router.push({ name: 'dashboard' });
        return;
    }

    setup_paypal();
});
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.payment-container {
    min-height: calc(100vh - 64px);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 2rem;
    background: #f9fafb;
}

.payment-card {
    background: white;
    padding: 2rem;
    border-radius: $radius-md;
    width: 100%;
    max-width: 520px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

// Plan Header
.plan-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;

    .plan-icon {
        font-size: 2.5rem;
    }

    .plan-details {
        h2 {
            margin: 0;
            font-size: 1.5rem;
            color: $color-text;
        }
    }
}

.subtitle {
    color: $color-text-light;
    margin-bottom: 1.5rem;
}

.divider {
    height: 1px;
    background: #e5e7eb;
    margin: 1.5rem 0;
}

h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
    color: $color-text;
    font-weight: 600;
}

// Period Selector
.period-selector {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.period-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: $radius-md;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;

    .period-label {
        font-weight: 600;
        color: $color-text;
    }

    .period-price {
        font-size: 1.1rem;
        font-weight: 700;
        color: $color-primary;
    }

    .period-badge {
        position: absolute;
        top: -10px;
        right: -10px;
        background: #10b981;
        color: white;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 0.25rem 0.5rem;
        border-radius: 99px;
    }

    &:hover {
        border-color: $color-primary;
    }

    &.active {
        border-color: $color-primary;
        background: rgba($color-primary, 0.05);
    }
}

// Selected Price
.selected-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f0fdf4;
    border-radius: $radius-md;
    border: 1px solid #bbf7d0;

    .total-label {
        font-weight: 500;
        color: #166534;
    }

    .total-amount {
        font-size: 1.5rem;
        font-weight: 700;
        color: #166534;
    }
}

// Method Selector
.payment-methods {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.method-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem;
    border: 2px solid #e5e7eb;
    border-radius: $radius-md;
    background: white;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;

    .method-icon {
        font-size: 1.25rem;
    }

    &:hover {
        border-color: $color-primary;
    }

    &.active {
        border-color: $color-primary;
        background: rgba($color-primary, 0.05);
        color: $color-primary;
    }
}

// PayPal Section
.paypal-section {
    .method-desc {
        color: $color-text-light;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        text-align: center;
    }

    .loading-text {
        text-align: center;
        color: $color-text-light;
        font-size: 0.9rem;
    }
}

// Offline Section
.offline-section {
    .offline-methods {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }

    .offline-method-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 99px;
        background: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;

        .icon {
            font-size: 1rem;
        }

        &:hover {
            border-color: $color-primary;
        }

        &.active {
            border-color: $color-primary;
            background: $color-primary;
            color: white;
        }
    }
}

.method-details {
    background: #f9fafb;
    padding: 1.25rem;
    border-radius: $radius-md;
    border: 1px solid #e5e7eb;

    .instructions {
        color: $color-text;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        line-height: 1.5;
    }
}

.details-list {
    margin-bottom: 1rem;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;

    .detail-label {
        color: $color-text-light;
        min-width: 80px;
    }

    .detail-value-wrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }

    .detail-value {
        background: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.85rem;
        border: 1px solid #e5e7eb;
        word-break: break-all;
    }

    .copy-btn {
        padding: 0.25rem;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        cursor: pointer;
        color: $color-text-light;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            color: $color-primary;
            border-color: $color-primary;
        }
    }
}

.amount-reminder {
    background: #fef3c7;
    color: #92400e;
    padding: 0.75rem;
    border-radius: $radius-md;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    text-align: center;
}

.reference-input {
    margin-bottom: 1rem;

    label {
        display: block;
        font-size: 0.85rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: $color-text;
    }

    input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: $radius-md;
        font-size: 0.95rem;

        &:focus {
            outline: none;
            border-color: $color-primary;
        }

        &:disabled {
            background: #f3f4f6;
        }
    }
}

.submit-btn {
    width: 100%;
    padding: 0.875rem;
    background: $color-primary;
    color: white;
    border: none;
    border-radius: $radius-md;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover:not(:disabled) {
        opacity: 0.9;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.select-method-hint {
    text-align: center;
    padding: 2rem;
    color: $color-text-light;

    p {
        margin: 0;
    }
}
</style>