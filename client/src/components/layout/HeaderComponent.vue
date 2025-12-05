<template>
    <header class="header">
        <div class="header__left">
            <button class="menu-btn" @click="$emit('toggle-sidebar')">
                <MenuIcon />
            </button>
            <h3>Bienvenido</h3>
        </div>

        <div class="header__right">
            <AppButtonComponent variant="secondary" @click="handle_logout">
                Cerrar Sesión
            </AppButtonComponent>
        </div>
    </header>
</template>

<script setup lang="ts">
import { use_auth_store } from '../../stores/auth-store';
import AppButtonComponent from '../common/AppButtonComponent.vue';
import { Menu as MenuIcon } from 'lucide-vue-next'; // Icono de menú

// Definimos los eventos que emite este componente
defineEmits(['toggle-sidebar']);

const auth_store = use_auth_store();

const handle_logout = () => {
    auth_store.logout();
};
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.header {
    height: 64px;
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem; // Reducido padding para móvil
    position: sticky;
    top: 0;
    z-index: 10;

    @media (min-width: $breakpoint-desktop) {
        padding: 0 2rem;
    }
}

.header__left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.menu-btn {
    display: flex; // Visible en móvil
    padding: 0.5rem;
    border-radius: $radius-md;

    &:hover {
        background-color: $color-bg;
    }

    // Ocultar en escritorio (cuando el sidebar ya es visible)
    @media (min-width: $breakpoint-desktop) {
        display: none;
    }
}
</style>