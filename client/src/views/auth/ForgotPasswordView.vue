<template>
    <div class="auth-container">
        <div class="auth-card">
            <!-- Estado: Formulario -->
            <div v-if="!email_sent">
                <div class="icon-header">
                    <KeyRound :size="40" />
                </div>
                <h2>¿Olvidaste tu contraseña?</h2>
                <p class="subtitle">
                    Ingresa tu correo y te enviaremos un enlace para restablecerla.
                </p>

                <form @submit.prevent="handle_submit">
                    <AppInputComponent id="email" v-model="email" type="email" placeholder="Correo Electrónico"
                        required />

                    <AppButtonComponent type="submit" :loading="is_loading">
                        Enviar enlace
                    </AppButtonComponent>
                </form>

                <p class="footer-text">
                    <router-link :to="{ name: 'login' }">← Volver al inicio de sesión</router-link>
                </p>
            </div>

            <!-- Estado: Email enviado -->
            <div v-else class="success-state">
                <div class="icon-wrapper">
                    <MailCheck :size="48" />
                </div>
                <h2>Revisa tu correo</h2>
                <p class="subtitle">
                    Si <strong>{{ email }}</strong> está registrado, recibirás un enlace para restablecer tu contraseña.
                </p>

                <div class="info-box">
                    <p>El enlace expira en <strong>60 minutos</strong>. Si no lo encuentras, revisa tu carpeta de spam.
                    </p>
                </div>

                <div class="actions">
                    <button class="resend-btn" @click="handle_submit" :disabled="is_loading || cooldown > 0">
                        <RefreshCw v-if="is_loading" class="spin" :size="16" />
                        <span v-if="cooldown > 0">Reenviar en {{ cooldown }}s</span>
                        <span v-else-if="is_loading">Enviando...</span>
                        <span v-else>Reenviar enlace</span>
                    </button>
                </div>

                <p class="footer-text">
                    <router-link :to="{ name: 'login' }">← Volver al inicio de sesión</router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { KeyRound, MailCheck, RefreshCw } from 'lucide-vue-next';
import AppInputComponent from '../../components/common/AppInputComponent.vue';
import AppButtonComponent from '../../components/common/AppButtonComponent.vue';
import api_client from '../../api/axios-client';
import { use_ui_store } from '../../stores/ui-store';

const ui_store = use_ui_store();

// State
const email = ref('');
const is_loading = ref(false);
const email_sent = ref(false);
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

// Submit handler
const handle_submit = async () => {
    if (!email.value || is_loading.value || cooldown.value > 0) return;

    is_loading.value = true;
    try {
        await api_client.post('/api/auth/forgot-password', { email: email.value });

        email_sent.value = true;
        start_cooldown();
    } catch (error: any) {
        // El interceptor maneja el error, pero por si acaso
        const message = error.response?.data?.message || 'Error al procesar la solicitud';
        ui_store.show_toast(message, 'error');
    } finally {
        is_loading.value = false;
    }
};

onUnmounted(() => {
    if (cooldown_interval) {
        clearInterval(cooldown_interval);
    }
});
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.auth-container {
    min-height: calc(100vh - 70px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.auth-card {
    background: white;
    padding: 2.5rem;
    border-radius: $radius-md;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 420px;
    text-align: center;
}

.icon-header {
    color: $color-primary;
    margin-bottom: 1rem;
}

h2 {
    color: $color-text;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
}

.subtitle {
    color: $color-text-light;
    margin-bottom: 1.5rem;
    line-height: 1.5;

    strong {
        color: $color-primary;
    }
}

.footer-text {
    margin-top: 1.5rem;
    font-size: 0.9rem;

    a {
        color: $color-text-light;
        text-decoration: none;

        &:hover {
            color: $color-primary;
        }
    }
}

// Success state
.success-state {
    .icon-wrapper {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #d1fae5;
        color: #059669;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
    }
}

.info-box {
    background: #f3f4f6;
    padding: 1rem;
    border-radius: $radius-md;
    margin: 1.5rem 0;

    p {
        margin: 0;
        font-size: 0.9rem;
        color: $color-text-light;
        line-height: 1.5;
    }
}

.actions {
    margin: 1.5rem 0;
}

.resend-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: white;
    color: $color-primary;
    border: 1px solid $color-primary;
    border-radius: $radius-md;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
        background: rgba($color-primary, 0.05);
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
</style>