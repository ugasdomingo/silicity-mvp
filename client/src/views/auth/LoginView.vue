<template>
    <div class="auth-container">
        <div class="auth-card">
            <h2>Iniciar Sesión</h2>
            <p class="subtitle">Bienvenido(a) de nuevo</p>

            <form @submit.prevent="handle_submit">
                <AppInputComponent id="email" v-model="form.email" type="email" placeholder="Correo Electrónico"
                    required />

                <AppInputComponent id="password" v-model="form.password" type="password" placeholder="Contraseña"
                    required />
                <p class="forgot-link">
                    <router-link :to="{ name: 'forgot-password' }">¿Olvidaste tu contraseña?</router-link>
                </p>

                <AppButtonComponent type="submit" :loading="auth_store.is_loading">
                    Entrar
                </AppButtonComponent>
            </form>

            <p class="footer-text">
                ¿No tienes cuenta? <router-link :to="{ name: 'register' }">Regístrate</router-link>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { use_auth_store } from '../../stores/auth-store';
import AppInputComponent from '../../components/common/AppInputComponent.vue';
import AppButtonComponent from '../../components/common/AppButtonComponent.vue';

const auth_store = use_auth_store();

const form = reactive({
    email: '',
    password: ''
});

const handle_submit = () => {
    auth_store.login(form);
};
</script>

<style scoped lang="scss">
// Mismos estilos básicos
.auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.auth-card {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;

    h2 {
        color: #6366f1;
    }

    .subtitle {
        color: #6b7280;
        margin-bottom: 1.5rem;
    }
}

.forgot-link {
    margin-top: 1rem;
    font-size: 0.85rem;

    a {
        color: #6b7280;
        text-decoration: none;

        &:hover {
            color: #6366f1;
            text-decoration: underline;
        }
    }
}

.footer-text {
    margin-top: 1rem;
    font-size: 0.9rem;

    a {
        color: #6366f1;
        font-weight: 600;
    }
}
</style>