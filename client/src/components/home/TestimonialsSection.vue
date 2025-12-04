<script setup lang="ts">
import { Quote } from 'lucide-vue-next';

const testimonials = [
    {
        id: 1,
        text: "Conseguí una beca de Platzi gracias a Silicity. Ahora trabajo remoto para una empresa europea. Sin esa oportunidad, seguiría sin poder pagar cursos.",
        name: "Andrea G.",
        role: "Frontend Developer",
        type: "Becada 2023"
    },
    {
        id: 2,
        text: "Los grupos de estudio me salvaron. Estudiar solo siempre terminaba en abandonar. Aquí encontré gente como yo y nos apoyamos mutuamente.",
        name: "Carlos M.",
        role: "Data Analyst",
        type: "Miembro Basic"
    },
    {
        id: 3,
        text: "Participé en 3 proyectos de empresas reales. Mi portafolio creció increíblemente y ahora tengo entrevistas cada semana.",
        name: "Sofía R.",
        role: "UX Designer",
        type: "Talento Premium"
    }
];
</script>

<template>
    <section class="testimonials-section">
        <div class="container">

            <div class="section-header">
                <h2>Historias reales de <span class="highlight">nuestra comunidad</span></h2>
                <p class="subtitle">
                    Personas como tú que ya están transformando su futuro profesional.
                </p>
            </div>

            <div class="grid">
                <div v-for="item in testimonials" :key="item.id" class="testimonial-card">
                    <div class="quote-icon">
                        <Quote class="icon" />
                    </div>
                    <p class="text">"{{ item.text }}"</p>

                    <div class="author">
                        <div class="avatar-placeholder">
                            {{ item.name.charAt(0) }}
                        </div>
                        <div class="info">
                            <h4>{{ item.name }}</h4>
                            <span class="role">{{ item.role }}</span>
                            <span class="badge">{{ item.type }}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>
</template>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.testimonials-section {
    padding: 6rem 0;
    background-color: #f9fafb;
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

        .highlight {
            color: $color-primary;
        }
    }

    .subtitle {
        font-size: 1.1rem;
        color: #6b7280;
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

.testimonial-card {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
    border: 1px solid #e5e7eb;
    position: relative;
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
    }
}

.quote-icon {
    color: rgba($color-primary, 0.2);
    margin-bottom: 1rem;

    .icon {
        width: 32px;
        height: 32px;
        fill: currentColor;
    }
}

.text {
    font-size: 1rem;
    line-height: 1.6;
    color: #374151;
    margin-bottom: 2rem;
    font-style: italic;
}

.author {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.avatar-placeholder {
    width: 48px;
    height: 48px;
    background-color: $color-primary;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.2rem;
}

.info {
    display: flex;
    flex-direction: column;

    h4 {
        font-size: 1rem;
        font-weight: 700;
        color: #111827;
        line-height: 1.2;
    }

    .role {
        font-size: 0.85rem;
        color: #6b7280;
    }

    .badge {
        display: inline-block;
        font-size: 0.7rem;
        background: #e0e7ff;
        color: $color-primary;
        padding: 2px 6px;
        border-radius: 4px;
        margin-top: 4px;
        align-self: flex-start;
        font-weight: 600;
    }
}
</style>