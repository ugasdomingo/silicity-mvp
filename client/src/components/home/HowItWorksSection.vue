<script setup lang="ts">
import { FileText, Users, Laptop, Target } from 'lucide-vue-next';

const steps = [
    {
        id: 1,
        title: 'Regístrate y Postula',
        text: 'Crea tu cuenta gratuita y postula a becas con tu historia y motivación. Seleccionamos 10 becados cada convocatoria.',
        icon: FileText
    },
    {
        id: 2,
        title: 'Aprende en Comunidad',
        text: 'Únete a grupos de estudio por temas, recibe acompañamiento psicológico y orientación vocacional para lograr tus objetivos.',
        icon: Users
    },
    {
        id: 3,
        title: 'Demuestra tu Talento',
        text: 'Participa en proyectos reales de empresas y VCs. Trabaja en equipos, construye portafolio y gana experiencia práctica.',
        icon: Laptop
    },
    {
        id: 4,
        title: 'Consigue Oportunidades',
        text: 'Empresas e inversionistas ven tu trabajo. Si destacas, puedes ser contratado o conseguir financiamiento para tu emprendimiento.',
        icon: Target
    }
];
</script>

<template>
    <section class="how-it-works">
        <div class="container">

            <div class="section-header">
                <h2>Tu camino hacia el éxito tech en 4 pasos</h2>
                <p class="subtitle">
                    Un proceso diseñado para eliminar barreras y acelerar tu crecimiento profesional.
                </p>
            </div>

            <div class="steps-container">
                <div class="connector-line"></div>

                <div v-for="step in steps" :key="step.id" class="step-card">
                    <div class="icon-circle">
                        <component :is="step.icon" class="step-icon" />
                        <div class="step-number">{{ step.id }}</div>
                    </div>

                    <h3>{{ step.title }}</h3>
                    <p>{{ step.text }}</p>
                </div>
            </div>

        </div>
    </section>
</template>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.how-it-works {
    padding: 6rem 0;
    background-color: #f9fafb; // Gris muy claro para separar secciones
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.section-header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 5rem;

    h2 {
        font-size: 2.25rem;
        font-weight: 800;
        color: #111827;
        margin-bottom: 1rem;
    }

    .subtitle {
        font-size: 1.1rem;
        color: #6b7280;
        line-height: 1.6;
    }
}

.steps-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
    position: relative;

    @media (min-width: 992px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
    }
}

/* LÍNEA CONECTORA */
.connector-line {
    display: none; // Oculto en móvil

    @media (min-width: 992px) {
        display: block;
        position: absolute;
        top: 40px; // Alinear con el centro de los círculos
        left: 10%; // Empezar un poco después del borde
        right: 10%; // Terminar un poco antes
        height: 4px;
        background: #e5e7eb;
        z-index: 0;
        border-radius: 4px;
    }
}

.step-card {
    text-align: center;
    position: relative;
    z-index: 1; // Para estar sobre la línea
    padding: 0 1rem;

    h3 {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
        color: #111827;
    }

    p {
        font-size: 0.95rem;
        color: #4b5563;
        line-height: 1.6;
    }
}

.icon-circle {
    width: 80px;
    height: 80px;
    background-color: white;
    border: 2px solid $color-primary;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    position: relative;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.1);
        background-color: $color-primary;

        .step-icon {
            color: white;
        }

        .step-number {
            background-color: white;
            color: $color-primary;
        }
    }
}

.step-icon {
    width: 32px;
    height: 32px;
    color: $color-primary;
    transition: color 0.3s ease;
}

.step-number {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 28px;
    height: 28px;
    background-color: $color-primary;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
    border: 2px solid white;
    transition: all 0.3s ease;
}
</style>