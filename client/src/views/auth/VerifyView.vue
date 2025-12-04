<template>
    <div class="verify-container">
        <div class="verify-card">
            <div v-if="auth_store.is_loading" class="loader-wrapper">
                <div class="spinner"></div>
                <h3>Verificando tu cuenta...</h3>
            </div>

            <div v-else class="error-wrapper">
                <h3 class="error-text">Enlace inválido o expirado</h3>
                <p>Por favor intenta registrarte nuevamente o solicita un nuevo enlace.</p>
                <router-link :to="{ name: 'login' }" class="btn-link">Volver al inicio</router-link>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { use_auth_store } from '../../stores/auth-store';

const route = useRoute();
const auth_store = use_auth_store();

onMounted(() => {
    const email = route.query.email as string;
    const code = route.query.code as string;

    if (email && code) {
        // Ejecución automática
        auth_store.verify_email(email, code);
    } else {
        // Si faltan datos, mostramos error (loading false)
        auth_store.is_loading = false;
    }
});
</script>

<style scoped lang="scss">
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
</style>