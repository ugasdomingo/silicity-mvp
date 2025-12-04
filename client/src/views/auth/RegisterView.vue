<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { use_auth_store } from '../../stores/auth-store';
import AppInputComponent from '../../components/common/AppInputComponent.vue';
import AppButtonComponent from '../../components/common/AppButtonComponent.vue';

const route = useRoute();
const auth_store = use_auth_store();

const form = reactive({
    name: '',
    email: '',
    password: '',
    role: 'user', // Default
    website: ''   // Solo para B2B
});

// Detectar contexto al cargar
onMounted(() => {
    // Solo leemos el ROL de la URL (Ej: /register?role=company)
    if (route.query.role && ['student', 'talent', 'company', 'vc'].includes(route.query.role as string)) {
        form.role = route.query.role as string;
    }
});

// Lógica para saber si es B2B (Empresa o VC)
const is_b2b = computed(() => ['company', 'vc'].includes(form.role));

const page_title = computed(() => {
    if (form.role === 'company') return 'Crear cuenta de empresa';
    if (form.role === 'vc') return 'Crear cuenta de inversionista';
    if (form.role === 'student') return 'Registro Estudiante';
    if (form.role === 'talent') return 'Registro Talento';
    return 'Crear Cuenta Gratis';
});

const button_text = computed(() => {
    if (is_b2b.value) return 'Registrar Aliado';
    if (['student', 'talent'].includes(form.role)) return 'Registrarme y Pagar';
    return 'Registrarme';
});

const handle_submit = () => {
    auth_store.register(form);
};
</script>

<template>
    <div class="auth-container">
        <div class="auth-card">
            <h2>{{ page_title }}</h2>
            <p class="subtitle">Comienza tu viaje en Silicity</p>

            <form @submit.prevent="handle_submit">
                <AppInputComponent id="name" v-model="form.name"
                    :placeholder="is_b2b ? 'Nombre de la Organización' : 'Nombre Completo'" required />

                <AppInputComponent v-if="is_b2b" id="website" v-model="form.website" placeholder="Sitio Web o LinkedIn"
                    required />

                <AppInputComponent id="email" v-model="form.email" type="email" placeholder="Correo Electrónico"
                    required />

                <AppInputComponent id="password" v-model="form.password" type="password" placeholder="Contraseña"
                    required />

                <AppButtonComponent type="submit" :loading="auth_store.is_loading">
                    {{ button_text }}
                </AppButtonComponent>
            </form>

            <p class="footer-text">
                ¿Ya tienes cuenta? <router-link :to="{ name: 'login' }">Inicia Sesión</router-link>
            </p>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 70px);
    padding: 1rem;
}

.auth-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
    text-align: center;
}

h2 {
    color: $color-primary;
    margin-bottom: 0.5rem;
}

.subtitle {
    color: $color-text-light;
    margin-bottom: 1.5rem;
}

.footer-text {
    margin-top: 1rem;
    font-size: 0.9rem;

    a {
        color: $color-primary;
        font-weight: 600;
    }
}
</style>