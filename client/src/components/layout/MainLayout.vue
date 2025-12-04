<template>
    <div class="layout">
        <div class="overlay" :class="{ 'overlay--active': is_sidebar_open }" @click="is_sidebar_open = false"></div>

        <SidebarComponent :is_open="is_sidebar_open" @close="is_sidebar_open = false" />

        <main class="main-content">
            <HeaderComponent @toggle-sidebar="is_sidebar_open = !is_sidebar_open" />

            <div v-if="is_payment_pending" class="warning-banner">
                ⚠️ Tu pago está siendo verificado. Algunas funcionalidades Premium están restringidas.
            </div>

            <div class="page-content">
                <router-view />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { use_auth_store } from '../../stores/auth-store';
import SidebarComponent from './SidebarComponent.vue';
import HeaderComponent from './HeaderComponent.vue';

const auth_store = use_auth_store();
const is_sidebar_open = ref(false);

const is_payment_pending = computed(() => {
    return auth_store.user?.payment_status === 'pending';
});
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.layout {
    display: flex;
    min-height: 100vh;
    background-color: $color-bg;
    position: relative; // Para el overlay
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    transition: margin-left 0.3s;

    // En móvil ocupa todo el ancho (margin 0)
    margin-left: 0;

    // En escritorio deja espacio al sidebar
    @media (min-width: $breakpoint-desktop) {
        margin-left: 260px;
    }
}

// Fondo oscuro al abrir menú en móvil
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 40; // Debajo del sidebar (50) pero sobre el contenido
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s;

    &--active {
        opacity: 1;
        visibility: visible;
    }

    // Nunca mostrar en escritorio
    @media (min-width: $breakpoint-desktop) {
        display: none;
    }
}

.warning-banner {
    background-color: $color-warning;
    color: white;
    padding: 0.75rem 2rem;
    text-align: center;
    font-weight: 500;
    font-size: 0.9rem;
}

.page-content {
    padding: 1rem; // Padding menor en móvil
    flex: 1;

    @media (min-width: $breakpoint-desktop) {
        padding: 2rem;
    }
}
</style>