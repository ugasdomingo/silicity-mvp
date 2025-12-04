<template>
    <aside class="sidebar" :class="{ 'sidebar--open': is_open }">
        <div class="sidebar__header">
            <router-link :to="{ name: 'home' }" class="sidebar__logo">
                <h2>Silicity</h2>
            </router-link>
            <button class="close-btn" @click="$emit('close')">
                &times;
            </button>
        </div>

        <nav class="sidebar__nav">
            <router-link v-for="item in filtered_menu" :key="item.label" :to="{ name: item.route }" class="nav-item"
                active-class="active" @click="$emit('close')">
                <component :is="item.icon" class="icon" />
                <span>{{ item.label }}</span>
            </router-link>
        </nav>

        <div class="sidebar__footer">
            <div class="user-info">
                <p class="name">{{ auth_store.user?.name }}</p>
                <p class="role">{{ auth_store.user?.role }}</p>
            </div>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { use_auth_store } from '../../stores/auth-store';
import { LayoutDashboard, GraduationCap, Briefcase, Search, Wallet, UserCircle } from 'lucide-vue-next';

// Recibimos estado desde el padre
defineProps<{ is_open: boolean }>();
defineEmits(['close']);

const auth_store = use_auth_store();

// Definición del Menú Maestro
const all_menu_items = [
    {
        label: 'Dashboard',
        route: 'dashboard',
        icon: LayoutDashboard,
        roles: ['user', 'student', 'talent', 'company', 'vc', 'Admin']
    },
    {
        label: 'Mis Becas',
        route: 'scholarships', // Crearemos esta ruta luego
        icon: GraduationCap,
        roles: ['student', 'talent']
    },
    {
        label: 'Proyectos Reales',
        route: 'projects',
        icon: Briefcase,
        roles: ['talent']
    },
    {
        label: 'Buscar Talento',
        route: 'talent-search',
        icon: Search,
        roles: ['company', 'vc']
    },
    {
        label: 'Inversiones',
        route: 'investments',
        icon: Wallet,
        roles: ['vc']
    },
    {
        label: 'Mi Perfil',
        route: 'profile',
        icon: UserCircle,
        roles: ['user', 'student', 'talent', 'company', 'vc', 'Admin']
    },
];

// Filtramos el menú según el rol del usuario
const filtered_menu = computed(() => {
    const current_role = auth_store.user?.role || 'user';
    return all_menu_items.filter(item => item.roles.includes(current_role));
});
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.sidebar {
    width: 260px;
    background-color: white;
    height: 100vh;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;

    transition: transform 0.3s ease-in-out;

    transform: translateX(-100%);

    &--open {
        transform: translateX(0) !important;
        box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
    }

    @media (min-width: $breakpoint-desktop) {
        transform: translateX(0) !important;
        z-index: 1;
        box-shadow: none;
    }
}

.sidebar__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 1rem; // Espacio para la X
}

.sidebar__logo {
    padding: 1.5rem;

    h2 {
        color: $color-primary;
        font-weight: 800;
    }
}

.close-btn {
    font-size: 2rem;
    line-height: 1;
    background: none;
    border: none;
    cursor: pointer;
    color: $color-text-light;

    @media (min-width: $breakpoint-desktop) {
        display: none;
    }
}

.sidebar__nav {
    flex: 1;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: $color-text-light;
    border-radius: $radius-md;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;

    .icon {
        width: 20px;
        height: 20px;
    }

    &:hover {
        background-color: rgba($color-primary, 0.05);
        color: $color-primary;
    }

    &.active {
        background-color: rgba($color-primary, 0.1);
        color: $color-primary;
        font-weight: 600;
    }
}

.sidebar__footer {
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;

    .name {
        font-weight: 600;
        font-size: 0.9rem;
    }

    .role {
        font-size: 0.8rem;
        color: $color-text-light;
        text-transform: capitalize;
    }
}
</style>