<script setup lang="ts">
// Aunque no haya lógica compleja, el script es necesario para TS
</script>

<template>
    <nav class="public-nav">
        <div class="container nav-content">
            <router-link :to="{ name: 'home' }" class="logo">
                <img src="/logo.svg" alt="logo silicity">
                Silicity
            </router-link>

            <div class="nav-links">
                <router-link :to="{ name: 'login' }" class="nav-link">
                    Iniciar Sesión
                </router-link>

                <router-link :to="{ name: 'register' }" class="btn-register">
                    Únete Ahora
                </router-link>
            </div>
        </div>
    </nav>
</template>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.public-nav {
    height: 70px;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 50;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 100%;
}

.nav-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: 800;
    color: $color-primary;
    text-decoration: none;

    img {
        width: 40px;
        height: 40px;
        margin-right: 1rem;
        object-fit: contain;
    }
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.nav-link {
    color: $color-text;
    font-size: 0.75rem;
    font-weight: 500;
    text-decoration: none;
    text-align: center;
    transition: color 0.2s;

    &:hover {
        color: $color-primary;
    }

    @media (min-width: $breakpoint-desktop) {
        padding: 0.75rem 2rem;
        font-size: 1rem;
    }
}

.btn-register {
    background-color: $color-primary;
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: $radius-md;
    font-size: 0.75rem;
    font-weight: 400;
    text-decoration: none;
    text-align: center;
    transition: background 0.2s;

    &:hover {
        background-color: $color-primary-dark;
    }

    @media (min-width: $breakpoint-desktop) {
        padding: 0.75rem 2rem;
        font-size: 1rem;
    }
}
</style>