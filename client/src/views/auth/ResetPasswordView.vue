<template>
    <div class="auth-container">
        <div class="auth-card">
            <!-- Estado: Token inválido o faltante -->
            <div v-if="!has_valid_params" class="error-state">
                <div class="icon-wrapper error">
                    <XCircle :size="48" />
                </div>
                <h2>Enlace inválido</h2>
                <p class="subtitle">
                    Este enlace no es válido o ha expirado. Por favor solicita uno nuevo.
                </p>
                <router-link :to="{ name: 'forgot-password' }" class="btn-primary">
                    Solicitar nuevo enlace
                </router-link>
            </div>

            <!-- Estado: Formulario de nueva contraseña -->
            <div v-else-if="!reset_success">
                <div class="icon-header">
                    <Lock :size="40" />
                </div>
                <h2>Nueva contraseña</h2>
                <p class="subtitle">
                    Ingresa tu nueva contraseña para la cuenta<br />
                    <strong>{{ user_email }}</strong>
                </p>

                <form @submit.prevent="handle_submit">
                    <AppInputComponent id="password" v-model="form.password" type="password"
                        placeholder="Nueva contraseña" required />

                    <AppInputComponent id="confirm_password" v-model="form.confirm_password" type="password"
                        placeholder="Confirmar contraseña" required />

                    <!-- Requisitos de contraseña -->
                    <div class="password-requirements">
                        <p class="req-title">La contraseña debe tener:</p>
                        <ul>
                            <li :class="{ valid: has_min_length }">
                                <Check v-if="has_min_length" :size="14" />
                                <X v-else :size="14" />
                                Mínimo 8 caracteres
                            </li>
                            <li :class="{ valid: has_uppercase }">
                                <Check v-if="has_uppercase" :size="14" />
                                <X v-else :size="14" />
                                Una letra mayúscula
                            </li>
                            <li :class="{ valid: has_number }">
                                <Check v-if="has_number" :size="14" />
                                <X v-else :size="14" />
                                Un número
                            </li>
                            <li :class="{ valid: passwords_match }">
                                <Check v-if="passwords_match" :size="14" />
                                <X v-else :size="14" />
                                Las contraseñas coinciden
                            </li>
                        </ul>
                    </div>

                    <AppButtonComponent type="submit" :loading="is_loading" :disabled="!is_form_valid">
                        Cambiar contraseña
                    </AppButtonComponent>
                </form>

                <p v-if="error_message" class="error-text">{{ error_message }}</p>
            </div>

            <!-- Estado: Éxito -->
            <div v-else class="success-state">
                <div class="icon-wrapper success">
                    <CheckCircle :size="48" />
                </div>
                <h2>¡Contraseña actualizada!</h2>
                <p class="subtitle">
                    Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión.
                </p>
                <router-link :to="{ name: 'login' }" class="btn-primary">
                    Iniciar sesión
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Lock, Check, X, CheckCircle, XCircle } from 'lucide-vue-next';
import AppInputComponent from '../../components/common/AppInputComponent.vue';
import AppButtonComponent from '../../components/common/AppButtonComponent.vue';
import api_client from '../../api/axios-client';
import { use_ui_store } from '../../stores/ui-store';

const route = useRoute();
const ui_store = use_ui_store();

// State
const reset_token = ref('');
const user_email = ref('');
const has_valid_params = ref(false);
const is_loading = ref(false);
const reset_success = ref(false);
const error_message = ref('');

const form = reactive({
    password: '',
    confirm_password: ''
});

// Validaciones
const has_min_length = computed(() => form.password.length >= 8);
const has_uppercase = computed(() => /[A-Z]/.test(form.password));
const has_number = computed(() => /[0-9]/.test(form.password));
const passwords_match = computed(() =>
    form.password.length > 0 && form.password === form.confirm_password
);

const is_form_valid = computed(() =>
    has_min_length.value &&
    has_uppercase.value &&
    has_number.value &&
    passwords_match.value
);

// Submit handler
const handle_submit = async () => {
    if (!is_form_valid.value || is_loading.value) return;

    error_message.value = '';
    is_loading.value = true;

    try {
        await api_client.post('/api/auth/reset-password', {
            token: reset_token.value,
            email: user_email.value,
            password: form.password
        });

        reset_success.value = true;
        ui_store.show_toast('Contraseña actualizada correctamente', 'success');
    } catch (error: any) {
        const message = error.response?.data?.message || 'Error al restablecer la contraseña';

        // Si el token expiró o es inválido
        if (error.response?.status === 400 && message.includes('expirado')) {
            has_valid_params.value = false;
        } else {
            error_message.value = message;
        }
    } finally {
        is_loading.value = false;
    }
};

// Init
onMounted(() => {
    const token = route.query.token as string;
    const email = route.query.email as string;

    if (token && email) {
        reset_token.value = token;
        user_email.value = email;
        has_valid_params.value = true;
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

// Password requirements
.password-requirements {
    text-align: left;
    background: #f9fafb;
    padding: 1rem;
    border-radius: $radius-md;
    margin-bottom: 1.5rem;

    .req-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: $color-text;
        margin: 0 0 0.5rem;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: #dc2626;
        margin-bottom: 0.25rem;

        &.valid {
            color: #059669;
        }
    }
}

// States
.error-state,
.success-state {
    .icon-wrapper {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;

        &.success {
            background: #d1fae5;
            color: #059669;
        }

        &.error {
            background: #fee2e2;
            color: #dc2626;
        }
    }
}

.btn-primary {
    display: inline-block;
    padding: 0.75rem 2rem;
    background: $color-primary;
    color: white;
    border-radius: $radius-md;
    font-weight: 500;
    text-decoration: none;
    margin-top: 1rem;
    transition: opacity 0.2s;

    &:hover {
        opacity: 0.9;
    }
}

.error-text {
    color: #dc2626;
    font-size: 0.9rem;
    margin-top: 1rem;
}
</style>