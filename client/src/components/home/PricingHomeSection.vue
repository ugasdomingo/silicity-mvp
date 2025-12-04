<script setup lang="ts">
import { ref, computed } from 'vue';
import { Check } from 'lucide-vue-next';

// Estado del Toggle (false = Trimestral, true = Anual)
const isAnnual = ref(true);

// Datos de los planes
const plans = computed(() => [
    {
        id: 'free',
        name: 'Curioso',
        price: '0€',
        period: 'siempre',
        description: 'Exploración completa',
        features: [
            'Explorar becas',
            'Ver proyectos activos',
            'Recursos gratuitos'
        ],
        cta: 'Empezar Gratis',
        route: { name: 'register' }, // Sin query = rol user (free)
        highlight: false
    },
    {
        id: 'student',
        name: 'Estudiante',
        price: isAnnual.value ? '50€' : '15€',
        period: isAnnual.value ? '/ año' : '/ trimestre',
        description: 'Becas, comunidad y orientación.',
        features: [
            'Postular a becas completas',
            'Grupos de estudio + Chat',
            'Acompañamiento psicológico',
            'Orientación vocacional'
        ],
        cta: 'Hacerme Estudiante',
        route: { name: 'register', query: { role: 'student' } },
        highlight: true,
        badge: 'Más Popular'
    },
    {
        id: 'talent',
        name: 'Talento',
        price: isAnnual.value ? '100€' : '30€',
        period: isAnnual.value ? '/ año' : '/ trimestre',
        description: 'Proyectos y vitrina profesional.',
        features: [
            'Todo lo de Estudiante',
            'Proyectos reales empresas',
            'Evaluación psicológica',
            'Vitrina de talento'
        ],
        cta: 'Ser Talento',
        route: { name: 'register', query: { role: 'talent' } },
        highlight: false
    }
]);
</script>

<template>
    <section class="pricing-section" id="planes">
        <div class="container">

            <div class="section-header">
                <h2>Sin sorpresas. Precios claros.</h2>
                <p class="subtitle">
                    Invierte en tu futuro al precio de un café al mes.
                </p>

                <div class="pricing-toggle">
                    <span :class="{ active: !isAnnual }">Trimestral</span>
                    <button class="toggle-btn" :class="{ 'is-annual': isAnnual }" @click="isAnnual = !isAnnual"
                        aria-label="Cambiar frecuencia de pago">
                        <div class="toggle-circle"></div>
                    </button>
                    <span :class="{ active: isAnnual }">
                        Anual <span class="savings-badge">Ahorra 40%</span>
                    </span>
                </div>
            </div>

            <div class="pricing-grid">
                <div v-for="plan in plans" :key="plan.id" class="pricing-card"
                    :class="{ 'highlight-card': plan.highlight }">
                    <div v-if="plan.highlight" class="popular-badge">
                        {{ plan.badge }}
                    </div>

                    <h3>{{ plan.name }}</h3>
                    <div class="price-container">
                        <span class="amount">{{ plan.price }}</span>
                        <span class="period">{{ plan.period }}</span>
                    </div>
                    <p class="desc">{{ plan.description }}</p>

                    <ul class="features-list">
                        <li v-for="(feat, index) in plan.features" :key="index">
                            <Check class="icon" /> {{ feat }}
                        </li>
                    </ul>

                    <router-link :to="plan.route" class="btn" :class="plan.highlight ? 'btn-primary' : 'btn-outline'">
                        {{ plan.cta }}
                    </router-link>
                </div>
            </div>

            <div class="b2b-note">
                <p>💡 <strong>Empresas y VCs:</strong> Primer año completamente gratis.</p>
            </div>

        </div>
    </section>
</template>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;
@use '@/assets/scss/abstracts/mixins' as *; // Importamos para usar shade()

.pricing-section {
    padding: 6rem 0;
    background-color: white;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.section-header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 4rem;

    h2 {
        font-size: 2.25rem;
        font-weight: 800;
        color: #111827;
        margin-bottom: 1rem;
    }

    .subtitle {
        font-size: 1.1rem;
        color: #6b7280;
        margin-bottom: 2rem;
    }
}

/* --- TOGGLE --- */
.pricing-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    font-weight: 600;
    color: #6b7280;

    span.active {
        color: #111827;
    }
}

.toggle-btn {
    width: 56px;
    height: 32px;
    background-color: #e5e7eb;
    border-radius: 99px;
    border: none;
    position: relative;
    cursor: pointer;
    transition: background-color 0.3s;

    &.is-annual {
        background-color: $color-primary;

        .toggle-circle {
            transform: translateX(24px);
        }
    }

    .toggle-circle {
        width: 24px;
        height: 24px;
        background-color: white;
        border-radius: 50%;
        position: absolute;
        top: 4px;
        left: 4px;
        transition: transform 0.3s;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
}

.savings-badge {
    background-color: #dcfce7;
    color: #166534;
    font-size: 0.75rem;
    padding: 0.15rem 0.5rem;
    border-radius: 99px;
    margin-left: 0.5rem;
    vertical-align: middle;
}

/* --- GRID --- */
.pricing-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 3rem;

    @media (min-width: 992px) {
        grid-template-columns: repeat(3, 1fr);
        align-items: center; // Para que la central pueda ser más alta
    }
}

.pricing-card {
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    position: relative;
    background: white;
    transition: transform 0.3s;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    }

    &.highlight-card {
        border: 2px solid $color-primary;
        box-shadow: 0 10px 40px rgba(99, 102, 241, 0.1);
        padding: 3rem 2rem; // Más alto
        z-index: 2;

        @media (min-width: 992px) {
            transform: scale(1.05);
        }

        &:hover {
            @media (min-width: 992px) {
                transform: scale(1.08);
            }
        }
    }
}

.popular-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background-color: $color-primary;
    color: white;
    font-size: 0.85rem;
    font-weight: 700;
    padding: 0.25rem 1rem;
    border-radius: 99px;
}

h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #111827;
}

.price-container {
    display: flex;
    align-items: baseline;
    justify-content: center;
    margin-bottom: 0.5rem;

    .amount {
        font-size: 3rem;
        font-weight: 800;
        color: #111827;
    }

    .period {
        font-size: 1rem;
        color: #6b7280;
        font-weight: 500;
        margin-left: 0.25rem;
    }
}

.desc {
    color: #6b7280;
    margin-bottom: 2rem;
    min-height: 48px;
}

.features-list {
    list-style: none;
    margin-bottom: 2rem;
    text-align: left;

    li {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
        color: #374151;
        font-size: 0.95rem;

        .icon {
            color: $color-success;
            width: 18px;
            height: 18px;
            flex-shrink: 0;
        }
    }
}

.btn {
    display: block;
    width: 100%;
    padding: 0.875rem;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;

    &-primary {
        background-color: $color-primary;
        color: white;

        &:hover {
            background-color: shade($color-primary, 5%);
        }

        // Usando shade()
    }

    &-outline {
        border: 1px solid #e5e7eb;
        color: #111827;

        &:hover {
            border-color: $color-primary;
            color: $color-primary;
        }
    }
}

.b2b-note {
    text-align: center;
    color: #4b5563;
    font-size: 0.95rem;
    background-color: #f9fafb;
    padding: 1rem;
    border-radius: 8px;
    max-width: 600px;
    margin: 0 auto;
}
</style>