<script setup lang="ts">
// Sin lógica
</script>

<template>
    <section class="cta-final">
        <div class="container">
            <div class="cta-content">
                <h2>Da el primer paso hacia tu futuro tech</h2>
                <p>Únete a cientos de estudiantes, empresas y VCs que ya están construyendo el Silicon Valley digital de
                    Latinoamérica.</p>

                <div class="actions">
                    <router-link :to="{ name: 'register' }" class="btn btn-white">
                        Crear Cuenta Gratis
                    </router-link>
                    <a href="#planes" class="btn btn-outline">
                        Ver Planes
                    </a>
                </div>

                <div class="stats">
                    <div class="stat-item"><strong>10</strong> Becas anuales</div>
                    <div class="stat-item"><strong>15€</strong> Desde / trimestre</div>
                    <div class="stat-item"><strong>0€</strong> Costo de explorar</div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;
@use '@/assets/scss/abstracts/mixins' as *;

.cta-final {
    padding: 6rem 1.5rem;
    background: linear-gradient(135deg, $color-primary 0%, #7c3aed 100%);
    color: white;
    text-align: center;
}

.container {
    max-width: 800px;
    margin: 0 auto;
}

h2 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    line-height: 1.1;

    @media (min-width: 768px) {
        font-size: 3rem;
    }
}

p {
    font-size: 1.25rem;
    margin-bottom: 2.5rem;
    opacity: 0.9;
}

.actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 3rem;

    @media (min-width: 480px) {
        flex-direction: row;
    }
}

.btn {
    padding: 1rem 2.5rem;
    border-radius: 99px;
    font-weight: 700;
    text-decoration: none;
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-3px);
    }

    &-white {
        background: white;
        color: $color-primary;
    }

    &-outline {
        background: transparent;
        border: 2px solid white;
        color: white;

        &:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    }
}

.stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
    font-size: 0.9rem;
    opacity: 0.8;

    .stat-item strong {
        font-size: 1.2rem;
        display: block;
    }
}
</style>