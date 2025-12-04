<script setup lang="ts">
import { AlertTriangle, CheckCircle2, ArrowDown } from 'lucide-vue-next';

const cards = [
    {
        id: 1,
        problemTitle: 'Barrera Económica',
        problemText: 'Los cursos de calidad cuestan entre $200 y $500 al año. Inaccesible para la gran mayoría en Latinoamérica.',
        solutionTitle: 'Educación Accesible',
        solutionText: 'Gestionamos 10 becas anuales completas y descuentos del 50-100% con las mejores plataformas.',
    },
    {
        id: 2,
        problemTitle: 'Aprender solo es difícil',
        problemText: 'Sin comunidad ni apoyo emocional, el 70% de los estudiantes abandona antes de terminar su formación.',
        solutionTitle: 'Comunidad y Soporte',
        solutionText: 'Grupos de estudio activos y acompañamiento psicológico profesional para que nunca tires la toalla.',
    },
    {
        id: 3,
        problemTitle: '¿Y después qué?',
        problemText: 'Terminas de estudiar... pero no tienes experiencia ni contactos para conseguir ese primer empleo.',
        solutionTitle: 'Puente al Empleo',
        solutionText: 'Participa en proyectos reales de empresas y accede a nuestra vitrina de talento exclusiva.',
    }
];
</script>

<template>
    <section class="problem-section">
        <div class="container">

            <div class="section-header">
                <h2>La educación tech no debería <span class="highlight">frenar tu talento</span></h2>
                <p class="subtitle">
                    Miles de talentos en Latinoamérica se quedan en el camino por barreras que no deberían existir.
                    Nosotros las derribamos.
                </p>
            </div>

            <div class="grid">
                <div v-for="card in cards" :key="card.id" class="split-card">

                    <div class="card-half problem">
                        <div class="icon-badge danger">
                            <AlertTriangle class="icon" />
                        </div>
                        <h3>{{ card.problemTitle }}</h3>
                        <p>{{ card.problemText }}</p>
                    </div>

                    <div class="connector">
                        <div class="arrow-circle">
                            <ArrowDown class="arrow-icon" />
                        </div>
                    </div>

                    <div class="card-half solution">
                        <div class="icon-badge success">
                            <CheckCircle2 class="icon" />
                        </div>
                        <h3>{{ card.solutionTitle }}</h3>
                        <p>{{ card.solutionText }}</p>
                    </div>

                </div>
            </div>

        </div>
    </section>
</template>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.problem-section {
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
        font-size: 2rem;
        font-weight: 800;
        color: #111827;
        margin-bottom: 1rem;

        .highlight {
            color: $color-danger; // Usamos rojo para enfatizar el problema a resolver
            position: relative;
            display: inline-block;

            &::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 0;
                width: 100%;
                height: 8px;
                background-color: rgba($color-danger, 0.1);
                z-index: -1;
            }
        }
    }

    .subtitle {
        font-size: 1.1rem;
        color: #6b7280;
        line-height: 1.6;
    }
}

.grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;

    @media (min-width: 992px) {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* --- SPLIT CARD DESIGN --- */
.split-card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    position: relative;
    transition: transform 0.3s ease;

    &:hover {
        transform: translateY(-5px);
    }
}

.card-half {
    padding: 2rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    h3 {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
        color: #111827;
    }

    p {
        font-size: 0.95rem;
        line-height: 1.5;
        color: #4b5563;
    }
}

/* ESTILOS PROBLEMA */
.problem {
    background-color: #fef2f2; // Rojo muy suave
    border-bottom: 1px dashed rgba($color-danger, 0.2);
    padding-bottom: 2.5rem; // Espacio para la flecha

    h3 {
        color: #991b1b;
    }
}

/* ESTILOS SOLUCIÓN */
.solution {
    background-color: #f0fdf4; // Verde muy suave
    padding-top: 2.5rem; // Espacio para la flecha

    h3 {
        color: #065f46;
    }
}

/* ICONOS */
.icon-badge {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;

    &.danger {
        background-color: white;
        color: $color-danger;
        box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1);
    }

    &.success {
        background-color: white;
        color: $color-success;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
    }

    .icon {
        width: 24px;
        height: 24px;
    }
}

/* FLECHA CONECTORA */
.connector {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
}

.arrow-circle {
    width: 40px;
    height: 40px;
    background-color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;

    .arrow-icon {
        width: 20px;
        height: 20px;
        color: $color-text-light;
    }
}
</style>