<template>
    <div class="verify-container">
        <div class="verify-card">
            <!-- Estado: Verificando automáticamente -->
            <div v-if="is_verifying" class="state-wrapper">
                <div class="spinner"></div>
                <h3>Verificando tu cuenta...</h3>
                <p class="subtitle">Esto tomará solo un momento</p>
            </div>

            <!-- Estado: Esperando acción del usuario (sin código en URL) -->
            <div v-else-if="show_manual_entry" class="state-wrapper">
                <div class="icon-wrapper success">
                    <MailCheck :size="48" />
                </div>
                <h3>Revisa tu correo</h3>
                <p class="subtitle">
                    Enviamos un enlace de verificación a<br />
                    <strong>{{ user_email }}</strong>
                </p>

                <div class="info-box">
                    <p>¿No lo encuentras? Revisa tu carpeta de spam o solicita uno nuevo.</p>
                </div>

                <div class="resend-section">
                    <button class="resend-btn" @click="handle_resend" :disabled="is_resending || cooldown > 0">
                        <RefreshCw v-if="is_resending" class="spin" :size="16" />
                        <span v-if="cooldown > 0">Reenviar en {{ cooldown }}s</span>
                        <span v-else-if="is_resending">Enviando...</span>
                        <span v-else>Reenviar código</span>
                    </button>
                </div>

                <router-link :to="{ name: 'login' }" class="back-link">
                    ← Volver al inicio
                </router-link>
            </div>

            <!-- Estado: Error -->
            <div v-else-if="show_error" class="state-wrapper">
                <div class="icon-wrapper error">
                    <XCircle :size="48" />
                </div>
                <h3 class="error-text">{{ error_message }}</h3>
                <p class="subtitle">{{ error_subtitle }}</p>

                <div v-if="user_email" class="resend-section">
                    <button class="resend-btn" @click="handle_resend" :disabled="is_resending || cooldown > 0">
                        <RefreshCw v-if="is_resending" class="spin" :size="16" />
                        <span v-if="cooldown > 0">Reenviar en {{ cooldown }}s</span>
                        <span v-else-if="is_resending">Enviando...</span>
                        <span v-else>Solicitar nuevo código</span>
                    </button>
                </div>

                <router-link :to="{ name: 'login' }" class="back-link">
                    ← Volver al inicio
                </router-link>
            </div>

            <!-- Estado: Éxito -->
            <div v-else-if="show_success" class="state-wrapper">
                <div class="icon-wrapper success">
                    <CheckCircle :size="48" />
                </div>
                <h3>¡Cuenta verificada!</h3>
                <p class="subtitle">Redirigiendo a tu panel...</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { use_auth_store } from '../../stores/auth-store';
import { use_ui_store } from '../../stores/ui-store';
import api_client from '../../api/axios-client';
import { MailCheck, RefreshCw, XCircle, CheckCircle } from 'lucide-vue-next';

const route = useRoute();
const auth_store = use_auth_store();
const ui_store = use_ui_store();

// State
const is_verifying = ref(false);
const is_resending = ref(false);
const show_manual_entry = ref(false);
const show_error = ref(false);
const show_success = ref(false);
const error_message = ref('');
const error_subtitle = ref('');
const user_email = ref('');
const cooldown = ref(0);

let cooldown_interval: number | null = null;

// Cooldown timer
const start_cooldown = () => {
    cooldown.value = 60;
    cooldown_interval = window.setInterval(() => {
        cooldown.value--;
        if (cooldown.value <= 0 && cooldown_interval) {
            clearInterval(cooldown_interval);
            cooldown_interval = null;
        }
    }, 1000);
};

// Resend handler
const handle_resend = async () => {
    if (!user_email.value || is_resending.value || cooldown.value > 0) return;

    is_resending.value = true;
    try {
        await api_client.post('/api/auth/resend-code', { email: user_email.value });
        ui_store.show_toast('Nuevo código enviado a tu correo', 'success');
        start_cooldown();

        // Si estábamos en error, volver a estado de espera
        if (show_error.value) {
            show_error.value = false;
            show_manual_entry.value = true;
        }
    } catch (error: any) {
        const message = error.response?.data?.message || 'Error al reenviar código';
        ui_store.show_toast(message, 'error');
    } finally {
        is_resending.value = false;
    }
};

// Verify with code from URL
const verify_with_code = async (email: string, code: string) => {
    is_verifying.value = true;
    try {
        const { data } = await api_client.post('/api/auth/verify', { email, code });

        // Éxito
        show_success.value = true;
        is_verifying.value = false;

        // Set session y redirigir
        if (data.data?.access_token) {
            auth_store.set_session(data.data);
            ui_store.show_toast('¡Cuenta verificada! Bienvenido(a)', 'success');
        }
    } catch (error: any) {
        is_verifying.value = false;
        show_error.value = true;

        const status = error.response?.status;
        const message = error.response?.data?.message || 'Error de verificación';

        if (status === 400 && message.includes('expirado')) {
            error_message.value = 'Código expirado';
            error_subtitle.value = 'El código de verificación ha expirado. Solicita uno nuevo.';
        } else if (status === 400 && message.includes('intentos')) {
            error_message.value = 'Demasiados intentos';
            error_subtitle.value = message;
        } else if (status === 400) {
            error_message.value = 'Código inválido';
            error_subtitle.value = 'El código de verificación no es correcto.';
        } else {
            error_message.value = 'Error de verificación';
            error_subtitle.value = message;
        }
    }
};

onMounted(() => {
    const email = route.query.email as string;
    const code = route.query.code as string;

    user_email.value = email || '';

    if (email && code) {
        // Verificación automática
        verify_with_code(email, code);
    } else if (email) {
        // Solo email, mostrar pantalla de espera
        show_manual_entry.value = true;
    } else {
        // Sin datos, mostrar error
        show_error.value = true;
        error_message.value = 'Enlace inválido';
        error_subtitle.value = 'Este enlace no contiene los datos necesarios para verificar tu cuenta.';
    }
});

onUnmounted(() => {
    if (cooldown_interval) {
        clearInterval(cooldown_interval);
    }
});
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.verify-container {
    min-height: calc(100vh - 70px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.verify-card {
    background: white;
    padding: 2.5rem;
    border-radius: $radius-md;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 420px;
    text-align: center;
}

.state-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;

    h3 {
        color: $color-text;
        margin: 1rem 0 0.25rem;
        font-size: 1.5rem;

        &.error-text {
            color: #dc2626;
        }
    }

    .subtitle {
        color: $color-text-light;
        margin: 0 0 1rem;
        line-height: 1.5;

        strong {
            color: $color-primary;
        }
    }
}

.icon-wrapper {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &.success {
        background: #d1fae5;
        color: #059669;
    }

    &.error {
        background: #fee2e2;
        color: #dc2626;
    }
}

.info-box {
    background: #f3f4f6;
    padding: 1rem;
    border-radius: $radius-md;
    margin: 1rem 0;

    p {
        margin: 0;
        font-size: 0.9rem;
        color: $color-text-light;
    }
}

.resend-section {
    margin: 1.5rem 0;
}

.resend-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: $color-primary;
    color: white;
    border: none;
    border-radius: $radius-md;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover:not(:disabled) {
        opacity: 0.9;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .spin {
        animation: spin 1s linear infinite;
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.back-link {
    display: inline-block;
    margin-top: 1rem;
    color: $color-text-light;
    font-size: 0.9rem;
    text-decoration: none;

    &:hover {
        color: $color-primary;
    }
}

// Spinner
.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
</style>