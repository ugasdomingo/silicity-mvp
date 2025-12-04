<script setup lang="ts">
// Aunque no haya lógica compleja, el script es necesario para TS
</script>

<template>
    <nav class="public-nav">
        <div class="container nav-content">
            <router-link :to="{ name: 'home' }" class="logo">
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
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.nav-link {
    color: $color-text;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
        color: $color-primary;
    }
}

.btn-register {
    background-color: $color-primary;
    color: white;
    padding: 0.5rem 1.25rem;
    border-radius: $radius-md;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.2s;

    &:hover {
        background-color: $color-primary-dark;
    }
}
</style>