<template>
    <div class="payment-container">
        <div class="payment-card">
            <h2>Elige tu Membresía</h2>

            <div class="plans">
                <div class="plan-card" :class="{ active: selected_plan === 'student' }"
                    @click="selected_plan = 'student'">
                    <h3>Student</h3>
                    <p class="price">15€ / año</p>
                </div>
                <div class="plan-card" :class="{ active: selected_plan === 'talent' }"
                    @click="selected_plan = 'talent'">
                    <h3>Talent</h3>
                    <p class="price">30€ / año</p>
                </div>
            </div>

            <div class="divider"></div>

            <div v-if="selected_plan">
                <h3>Método de Pago</h3>

                <div class="payment-methods">
                    <button :class="{ active: method === 'paypal' }" @click="method = 'paypal'">PayPal</button>
                    <button :class="{ active: method === 'offline' }" @click="method = 'offline'">USDT / Zelle</button>
                </div>

                <div v-if="method === 'paypal'" class="paypal-wrapper">
                    <div id="paypal-button-container"></div>
                </div>

                <div v-if="method === 'offline'" class="offline-wrapper">
                    <div class="bank-info">
                        <p><strong>USDT (TRC20):</strong> Txyz...1234</p>
                        <p><strong>Email Zelle:</strong> pagos@silicity.com</p>
                    </div>
                    <AppInputComponent id="ref" v-model="offline_ref" label="Número de Referencia / Hash"
                        placeholder="Ej: 0045823..." />
                    <AppButtonComponent @click="handle_offline_pay" :loading="is_loading">
                        Reportar Pago
                    </AppButtonComponent>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { loadScript } from '@paypal/paypal-js';
import api_client from '../../api/axios-client';
import { use_ui_store } from '../../stores/ui-store';
import { useRouter } from 'vue-router';
import AppInputComponent from '../../components/common/AppInputComponent.vue';
import AppButtonComponent from '../../components/common/AppButtonComponent.vue';

const router = useRouter();
const ui_store = use_ui_store();

const selected_plan = ref<'student' | 'talent'>('student');
const method = ref<'paypal' | 'offline'>('paypal');
const offline_ref = ref('');
const is_loading = ref(false);

// Cargar botón de PayPal
const render_paypal_button = async () => {
    // Limpiar contenedor previo
    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';

    const paypal = await loadScript({
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: 'EUR'
    });

    if (paypal && paypal.Buttons) {
        paypal.Buttons({
            // Crear Orden
            createOrder: async (_data, _actions) => {
                try {
                    const res = await api_client.post('/api/payments/paypal/create-order', {
                        plan: selected_plan.value
                    });
                    return res.data.data.order_id;
                } catch (err) {
                    console.error(err);
                    // ui_store.show_toast('Error iniciando PayPal', 'error'); // El interceptor ya lo hace
                    return '';
                }
            },
            // Capturar Pago
            onApprove: async (data, _actions) => {
                try {
                    await api_client.post('/api/payments/paypal/capture-order', {
                        order_id: data.orderID
                    });
                    ui_store.show_toast('¡Pago exitoso! Bienvenido(a).', 'success');
                    router.push({ name: 'dashboard' });
                } catch (err) {
                    console.error(err);
                }
            }
        }).render('#paypal-button-container');
    }
};

// Observar cambios para renderizar botón
watch([method, selected_plan], async () => {
    if (method.value === 'paypal') {
        // Pequeño delay para que el DOM exista
        setTimeout(() => render_paypal_button(), 100);
    }
});

onMounted(() => {
    render_paypal_button();
});

const handle_offline_pay = async () => {
    is_loading.value = true;
    try {
        await api_client.post('/api/payments/offline', {
            plan: selected_plan.value,
            reference: offline_ref.value
        });
        ui_store.show_toast('Reporte enviado. Esperando aprobación.', 'success');
        router.push({ name: 'home' });
    } catch (error) {
        // Interceptor maneja error
    } finally {
        is_loading.value = false;
    }
};
</script>

<style scoped lang="scss">
@use '../../assets/scss/abstracts/variables';

.payment-container {
    display: flex;
    justify-content: center;
    padding: 2rem;
}

.payment-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h2,
h3 {
    color: $color-primary;
    text-align: center;
    margin-bottom: 1rem;
}

.plans {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
}

.plan-card {
    flex: 1;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;

    &.active {
        border-color: $color-primary;
        background-color: rgba($color-primary, 0.05);
    }
}

.price {
    font-size: 1.2rem;
    font-weight: bold;
}

.payment-methods {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.payment-methods button {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    background: white;

    &.active {
        background: $color-primary;
        color: white;
        border-color: $color-primary;
    }
}

.offline-wrapper {
    .bank-info {
        background: #f3f4f6;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }
}
</style>